import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { exchangeTwitterCode } from "@/lib/oauth/twitter";

function fail(reason: string) {
  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=${encodeURIComponent(reason)}`
  );
}

// Twitter (X) OAuth callback: verifies state, exchanges the code with the PKCE
// verifier, fetches the user id, and stores the account.
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return fail("unauthorized");

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");
  if (errorParam) return fail(searchParams.get("error_description") ?? errorParam);

  const jar = await cookies();
  const savedState = jar.get("twitter_oauth_state")?.value;
  const codeVerifier = jar.get("twitter_oauth_verifier")?.value;
  jar.delete("twitter_oauth_state");
  jar.delete("twitter_oauth_verifier");

  if (!state || state !== savedState) return fail("invalid_state");
  if (!code || !codeVerifier) return fail("no_code");

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/twitter/callback`;

  let tokens;
  try {
    tokens = await exchangeTwitterCode(code, redirectUri, codeVerifier);
  } catch (e) {
    console.error("Twitter token exchange failed:", e);
    return fail(e instanceof Error ? e.message : "token_exchange_failed");
  }

  // Stable account id for providerAccountId.
  const meRes = await fetch("https://api.x.com/2/users/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const me = await meRes.json();
  const twitterId = me?.data?.id;
  if (!twitterId) {
    console.error("Twitter users/me failed:", JSON.stringify(me));
    return fail("invalid_token_response");
  }

  const accountData = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_at: tokens.expires_in
      ? Math.floor(Date.now() / 1000) + tokens.expires_in
      : null,
    token_type: "bearer",
    scope: tokens.scope ?? null,
    providerAccountId: String(twitterId),
  };

  const existing = await prisma.account.findFirst({
    where: { userId, provider: "twitter" },
  });
  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      data: {
        ...accountData,
        refresh_token: accountData.refresh_token ?? existing.refresh_token,
      },
    });
  } else {
    await prisma.account.create({
      data: { userId, type: "oauth", provider: "twitter", ...accountData },
    });
  }

  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?connected=twitter`
  );
}
