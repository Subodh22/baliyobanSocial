import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

function fail(reason: string) {
  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=${encodeURIComponent(reason)}`
  );
}

// LinkedIn OAuth callback: exchanges the code, fetches the member id from
// /v2/userinfo (postToLinkedIn builds urn:li:person:{id} from it), stores it.
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return fail("unauthorized");

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");
  if (errorParam) return fail(searchParams.get("error_description") ?? errorParam);

  const jar = await cookies();
  const savedState = jar.get("linkedin_oauth_state")?.value;
  jar.delete("linkedin_oauth_state");
  if (!state || state !== savedState) return fail("invalid_state");
  if (!code) return fail("no_code");

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/linkedin/callback`;

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.AUTH_LINKEDIN_ID!,
      client_secret: process.env.AUTH_LINKEDIN_SECRET!,
      redirect_uri: redirectUri,
    }),
  });
  const tokens = await tokenRes.json();
  if (!tokenRes.ok || tokens.error || !tokens.access_token) {
    console.error("LinkedIn token exchange failed:", JSON.stringify(tokens));
    return fail(tokens.error_description ?? tokens.error ?? "token_exchange_failed");
  }

  const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const me = await meRes.json();
  if (!me?.sub) {
    console.error("LinkedIn userinfo failed:", JSON.stringify(me));
    return fail("invalid_token_response");
  }

  const accountData = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_at: tokens.expires_in
      ? Math.floor(Date.now() / 1000) + tokens.expires_in
      : null,
    token_type: "bearer",
    scope: tokens.scope ?? "openid profile email w_member_social_v2",
    providerAccountId: String(me.sub),
  };

  const existing = await prisma.account.findFirst({
    where: { userId, provider: "linkedin" },
  });
  if (existing) {
    await prisma.account.update({ where: { id: existing.id }, data: accountData });
  } else {
    await prisma.account.create({
      data: { userId, type: "oauth", provider: "linkedin", ...accountData },
    });
  }

  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?connected=linkedin`
  );
}
