import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

function fail(reason: string) {
  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=${encodeURIComponent(reason)}`
  );
}

// Handles the Instagram OAuth callback: exchanges the code for a short-lived
// token, upgrades it to a long-lived (~60 day) token, and stores it.
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return fail("unauthorized");

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return fail(searchParams.get("error_description") ?? errorParam);
  }

  // Verify CSRF state
  const jar = await cookies();
  const savedState = jar.get("instagram_oauth_state")?.value;
  jar.delete("instagram_oauth_state");

  if (!state || state !== savedState) return fail("invalid_state");
  if (!code) return fail("no_code");

  const clientId = process.env.AUTH_INSTAGRAM_ID!;
  const clientSecret = process.env.AUTH_INSTAGRAM_SECRET!;
  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/instagram/callback`;

  // Exchange the authorization code for a short-lived token.
  // Instagram strips a trailing "#_" fragment onto the code in some browsers.
  const cleanCode = code.replace(/#_$/, "");
  const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code: cleanCode,
    }),
  });
  const shortData = await shortRes.json();
  // The response is usually flat, but some versions nest it under `data[0]`.
  const short = Array.isArray(shortData.data) ? shortData.data[0] : shortData;
  if (!shortRes.ok || shortData.error_type || !short?.access_token) {
    console.error("Instagram token exchange failed:", JSON.stringify(shortData));
    return fail(shortData.error_message ?? "token_exchange_failed");
  }

  // Upgrade to a long-lived token (~60 days).
  const longRes = await fetch(
    "https://graph.instagram.com/access_token?" +
      new URLSearchParams({
        grant_type: "ig_exchange_token",
        client_secret: clientSecret,
        access_token: short.access_token,
      }).toString()
  );
  const longData = await longRes.json();
  const accessToken: string = longData.access_token ?? short.access_token;
  const expiresIn: number | undefined = longData.expires_in;
  const igUserId = String(short.user_id ?? "");

  // The token response reports which permissions the user actually granted
  // (array or comma-separated). Store those so the Inbox knows whether comment
  // / message access is available without assuming it.
  const grantedScope = short.permissions
    ? Array.isArray(short.permissions)
      ? short.permissions.join(",")
      : String(short.permissions)
    : "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments,instagram_business_manage_messages";

  if (!accessToken || !igUserId) {
    console.error("Instagram token response missing fields:", JSON.stringify({ short, longData }));
    return fail("invalid_token_response");
  }

  const accountData = {
    access_token: accessToken,
    // IG long-lived tokens are refreshed by re-presenting the token itself,
    // so we keep a copy here to drive the refresh in the posts route.
    refresh_token: accessToken,
    expires_at: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : null,
    token_type: "bearer",
    scope: grantedScope,
    providerAccountId: igUserId,
  };

  const existing = await prisma.account.findFirst({
    where: { userId, provider: "instagram" },
  });

  if (existing) {
    await prisma.account.update({ where: { id: existing.id }, data: accountData });
  } else {
    await prisma.account.deleteMany({
      where: { provider: "instagram", providerAccountId: igUserId, userId: { not: userId } },
    });
    await prisma.account.create({
      data: { userId, type: "oauth", provider: "instagram", ...accountData },
    });
  }

  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?connected=instagram`
  );
}
