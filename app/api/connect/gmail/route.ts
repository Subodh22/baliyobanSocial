import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { googleAuthUrl } from "@/lib/oauth/google";

// Connects the user's Gmail via Google OAuth, stored as provider "gmail". Uses
// the same Google app as the YouTube connection but different scopes, so it's a
// separate Account row. gmail.send lets us reply/compose straight from the Inbox.
const SCOPE = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
].join(" ");

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = process.env.AUTH_GOOGLE_ID;
  if (!clientId)
    return Response.json(
      { error: "Google client ID (AUTH_GOOGLE_ID) not configured" },
      { status: 500 }
    );

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/gmail/callback`;

  const csrfState = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("gmail_oauth_state", csrfState, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return Response.redirect(
    googleAuthUrl({ clientId, redirectUri, scope: SCOPE, state: csrfState })
  );
}
