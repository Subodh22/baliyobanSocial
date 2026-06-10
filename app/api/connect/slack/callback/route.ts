import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

function fail(reason: string) {
  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?error=${encodeURIComponent(reason)}`
  );
}

// Slack OAuth v2 callback. We persist the USER token (authed_user.access_token)
// since that's what reads the user's channels and DMs.
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return fail("unauthorized");

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");
  if (errorParam) return fail(errorParam);

  const jar = await cookies();
  const savedState = jar.get("slack_oauth_state")?.value;
  jar.delete("slack_oauth_state");
  if (!state || state !== savedState) return fail("invalid_state");
  if (!code) return fail("no_code");

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/slack/callback`;

  const res = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const data = await res.json();

  // Slack returns HTTP 200 with { ok: false, error } on failure.
  if (!data.ok) {
    console.error("Slack oauth.v2.access failed:", JSON.stringify(data));
    return fail(data.error || "token_exchange_failed");
  }

  const userToken: string | undefined = data.authed_user?.access_token;
  const slackUserId: string | undefined = data.authed_user?.id;
  const teamId: string | undefined = data.team?.id;
  const teamName: string | undefined = data.team?.name;

  if (!userToken || !slackUserId) {
    console.error("Slack token response missing user token:", JSON.stringify(data));
    return fail("invalid_token_response");
  }

  const accountData = {
    access_token: userToken,
    refresh_token: null,
    expires_at: null, // Slack user tokens don't expire unless rotation is enabled
    token_type: "bearer",
    // Stash the team name in scope so the UI can show which workspace; the
    // granted scopes are recoverable from authed_user.scope if needed.
    scope: teamName ?? data.authed_user?.scope ?? null,
    providerAccountId: `${teamId ?? "team"}:${slackUserId}`,
  };

  const existing = await prisma.account.findFirst({
    where: { userId, provider: "slack" },
  });
  if (existing) {
    await prisma.account.update({ where: { id: existing.id }, data: accountData });
  } else {
    await prisma.account.create({
      data: { userId, type: "oauth", provider: "slack", ...accountData },
    });
  }

  return Response.redirect(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?connected=slack`
  );
}
