import { auth } from "@clerk/nextjs/server";
import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { TWITTER_AUTH_URL, TWITTER_SCOPE } from "@/lib/oauth/twitter";

// Starts the Twitter (X) OAuth 2.0 + PKCE flow.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = process.env.AUTH_TWITTER_ID;
  if (!clientId)
    return Response.json(
      { error: "Twitter client ID (AUTH_TWITTER_ID) not configured" },
      { status: 500 }
    );

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/twitter/callback`;

  const csrfState = randomBytes(16).toString("hex");
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const jar = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  };
  jar.set("twitter_oauth_state", csrfState, cookieOpts);
  jar.set("twitter_oauth_verifier", codeVerifier, cookieOpts);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: TWITTER_SCOPE,
    state: csrfState,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return Response.redirect(`${TWITTER_AUTH_URL}?${params.toString()}`);
}
