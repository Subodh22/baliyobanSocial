import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ensureUser } from "@/lib/user";
import { exchangeCode } from "@/lib/platforms/tiktok-auth";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const errorParam = url.searchParams.get("error");

  if (errorParam || !code) {
    const desc = url.searchParams.get("error_description") ?? "Authorization denied";
    redirect(`/dashboard?error=${encodeURIComponent(desc)}`);
  }

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const redirectUri = `${base}/api/auth/callback/tiktok`;

  try {
    const tokens = await exchangeCode(code, redirectUri);

    // Make sure the User row exists before creating the Account FK.
    await ensureUser();

    const expiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in;

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "tiktok",
          providerAccountId: tokens.open_id,
        },
      },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        scope: tokens.scope,
        token_type: tokens.token_type,
      },
      create: {
        userId,
        type: "oauth",
        provider: "tiktok",
        providerAccountId: tokens.open_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        scope: tokens.scope,
        token_type: tokens.token_type,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Token exchange failed";
    redirect(`/dashboard?error=${encodeURIComponent(msg)}`);
  }

  redirect("/dashboard?connected=tiktok");
}
