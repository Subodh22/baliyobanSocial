import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const GRAPH_VERSION = "v23.0";

function fail(reason: string) {
  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=${encodeURIComponent(reason)}`
  );
}

// Handles the Facebook OAuth callback: exchanges the code for a short-lived
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
  const savedState = jar.get("facebook_oauth_state")?.value;
  jar.delete("facebook_oauth_state");

  if (!state || state !== savedState) return fail("invalid_state");
  if (!code) return fail("no_code");

  const clientId = process.env.AUTH_FACEBOOK_ID!;
  const clientSecret = process.env.AUTH_FACEBOOK_SECRET!;
  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/facebook/callback`;

  // Exchange the authorization code for a short-lived access token.
  const shortRes = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?` +
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }).toString()
  );
  const shortData = await shortRes.json();
  if (!shortRes.ok || shortData.error || !shortData.access_token) {
    console.error("Facebook token exchange failed:", JSON.stringify(shortData));
    return fail(shortData.error?.message ?? "token_exchange_failed");
  }

  // Upgrade to a long-lived token (~60 days).
  const longRes = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?` +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: clientId,
        client_secret: clientSecret,
        fb_exchange_token: shortData.access_token,
      }).toString()
  );
  const longData = await longRes.json();
  const accessToken: string = longData.access_token ?? shortData.access_token;
  const expiresIn: number | undefined = longData.expires_in ?? shortData.expires_in;

  // Identify the connected user so we have a stable providerAccountId.
  const meRes = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/me?` +
      new URLSearchParams({ fields: "id,name", access_token: accessToken }).toString()
  );
  const me = await meRes.json();
  if (!meRes.ok || me.error || !me.id) {
    console.error("Facebook /me lookup failed:", JSON.stringify(me));
    return fail("invalid_token_response");
  }

  const accountData = {
    access_token: accessToken,
    refresh_token: null,
    expires_at: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : null,
    token_type: "bearer",
    scope: "public_profile,pages_show_list,pages_read_engagement,pages_manage_posts",
    providerAccountId: me.id as string,
  };

  const existing = await prisma.account.findFirst({
    where: { userId, provider: "facebook" },
  });

  if (existing) {
    await prisma.account.update({ where: { id: existing.id }, data: accountData });
  } else {
    await prisma.account.deleteMany({
      where: { provider: "facebook", providerAccountId: me.id as string, userId: { not: userId } },
    });
    await prisma.account.create({
      data: { userId, type: "oauth", provider: "facebook", ...accountData },
    });
  }

  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?connected=facebook`
  );
}
