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

// Google OAuth callback for the Gmail connection (provider "gmail").
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return fail("unauthorized");

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");
  if (errorParam) return fail(searchParams.get("error_description") ?? errorParam);

  const jar = await cookies();
  const savedState = jar.get("gmail_oauth_state")?.value;
  jar.delete("gmail_oauth_state");
  if (!state || state !== savedState) return fail("invalid_state");
  if (!code) return fail("no_code");

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/gmail/callback`;

  let tokens;
  try {
    tokens = await exchangeGoogleCode(code, redirectUri);
  } catch (e) {
    console.error("Gmail token exchange failed:", e);
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
    where: { userId, provider: "gmail" },
  });
  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      data: { ...accountData, refresh_token: accountData.refresh_token ?? existing.refresh_token },
    });
  } else {
    await prisma.account.deleteMany({
      where: { provider: "gmail", providerAccountId: info.id, userId: { not: userId } },
    });
    await prisma.account.create({
      data: { userId, type: "oauth", provider: "gmail", ...accountData },
    });
  }

  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?connected=gmail`
  );
}
