import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

// Connects a Slack workspace via OAuth v2. We request USER scopes (not bot
// scopes) so we can read the signed-in user's channels and DMs for the Inbox.
const USER_SCOPE = [
  "channels:history",
  "channels:read",
  "groups:history",
  "groups:read",
  "im:history",
  "im:read",
  "mpim:history",
  "mpim:read",
  "users:read",
].join(",");

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId)
    return Response.json(
      { error: "Slack client ID (SLACK_CLIENT_ID) not configured" },
      { status: 500 }
    );

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/slack/callback`;

  const csrfState = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("slack_oauth_state", csrfState, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    user_scope: USER_SCOPE,
    redirect_uri: redirectUri,
    state: csrfState,
  });

  return Response.redirect(
    `https://slack.com/oauth/v2/authorize?${params.toString()}`
  );
}
