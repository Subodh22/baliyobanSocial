import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { exchangeGoogleCode, googleUserInfo } from "@/lib/oauth/google";

function fail(reason: string) {
  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=${encodeURIComponent(reason)}`
  );
}

// Google OAuth callback for the YouTube connection (provider "google").
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return fail("unauthorized");

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");
  if (errorParam) return fail(searchParams.get("error_description") ?? errorParam);

  const jar = await cookies();
  const savedState = jar.get("google_oauth_state")?.value;
  jar.delete("google_oauth_state");
  if (!state || state !== savedState) return fail("invalid_state");
  if (!code) return fail("no_code");

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/google/callback`;

  let tokens;
  try {
    tokens = await exchangeGoogleCode(code, redirectUri);
  } catch (e) {
    console.error("Google token exchange failed:", e);
    return fail(e instanceof Error ? e.message : "token_exchange_failed");
  }

  const info = await googleUserInfo(tokens.access_token);
  if (!info?.id) return fail("invalid_token_response");

  const accountData = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_at: tokens.expires_in
      ? Math.floor(Date.now() / 1000) + tokens.expires_in
      : null,
    token_type: "bearer",
    scope: tokens.scope ?? null,
    providerAccountId: info.id,
  };

  const existing = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      // Keep the old refresh token if Google didn't return a new one.
      data: { ...accountData, refresh_token: accountData.refresh_token ?? existing.refresh_token },
    });
  } else {
    await prisma.account.deleteMany({
      where: { provider: "google", providerAccountId: info.id, userId: { not: userId } },
    });
    await prisma.account.create({
      data: { userId, type: "oauth", provider: "google", ...accountData },
    });
  }

  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?connected=google`
  );
}
