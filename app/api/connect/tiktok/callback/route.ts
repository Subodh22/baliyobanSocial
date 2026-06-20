import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// Handles the TikTok OAuth callback, exchanges the authorization code for
// an access token, and stores it in the Account table.
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.redirect(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=unauthorized`
    );

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    const desc = searchParams.get("error_description") ?? errorParam;
    return Response.redirect(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=${encodeURIComponent(desc)}`
    );
  }

  // Verify CSRF state
  const jar = await cookies();
  const savedState = jar.get("tiktok_oauth_state")?.value;
  jar.delete("tiktok_oauth_state");

  if (!state || state !== savedState)
    return Response.redirect(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=invalid_state`
    );

  if (!code)
    return Response.redirect(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=no_code`
    );

  const clientKey = process.env.AUTH_TIKTOK_ID!;
  const clientSecret = process.env.AUTH_TIKTOK_SECRET!;
  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/tiktok/callback`;

  // Exchange authorization code for access token
  const tokenRes = await fetch(
    "https://open.tiktokapis.com/v2/oauth/token/",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    }
  );

  const tokenData = await tokenRes.json();
  console.log("TikTok token response status:", tokenRes.status);
  console.log("TikTok token response body:", JSON.stringify(tokenData));

  if (!tokenRes.ok) {
    console.error("TikTok token exchange failed:", JSON.stringify(tokenData));
    return Response.redirect(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=token_exchange_failed`
    );
  }

  // TikTok's v2 token endpoint returns HTTP 200 even on failure, with the
  // error in the body. It can take two shapes: a flat OAuth error
  // ({ error: "invalid_grant", error_description: "..." }) or the resource-API
  // object form ({ error: { code, message } }). Handle both and surface the
  // real message instead of a generic error.
  const apiError =
    typeof tokenData.error === "string"
      ? tokenData.error_description || tokenData.error
      : tokenData.error?.code && tokenData.error.code !== "ok"
        ? tokenData.error.message || tokenData.error.code
        : null;

  if (apiError) {
    console.error("TikTok token exchange error:", JSON.stringify(tokenData));
    return Response.redirect(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=${encodeURIComponent(apiError)}`
    );
  }

  const payload = tokenData.data ?? tokenData;
  const accessToken: string = payload.access_token;
  const refreshToken: string | undefined = payload.refresh_token;
  const expiresIn: number | undefined = payload.expires_in;
  const openId: string = payload.open_id;
  const scope: string | undefined = payload.scope;

  if (!accessToken || !openId) {
    console.error("TikTok token response missing fields:", JSON.stringify(tokenData));
    return Response.redirect(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=invalid_token_response`
    );
  }

  // Upsert the TikTok account for this user
  const existing = await prisma.account.findFirst({
    where: { userId, provider: "tiktok" },
  });

  const accountData = {
    access_token: accessToken,
    refresh_token: refreshToken ?? null,
    expires_at: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : null,
    token_type: "bearer",
    scope: scope ?? null,
    providerAccountId: openId,
  };

  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      data: accountData,
    });
  } else {
    // Remove any stale row from a previous user that holds the same provider +
    // providerAccountId to avoid a UNIQUE constraint error.
    await prisma.account.deleteMany({
      where: { provider: "tiktok", providerAccountId: openId, userId: { not: userId } },
    });
    await prisma.account.create({
      data: {
        userId,
        type: "oauth",
        provider: "tiktok",
        ...accountData,
      },
    });
  }

  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?connected=tiktok`
  );
}
