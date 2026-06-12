import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

// Starts the LinkedIn OAuth flow. w_member_social is needed to post;
// openid/profile give us a stable member id via /v2/userinfo.
const SCOPE = "openid profile email w_member_social";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = process.env.AUTH_LINKEDIN_ID;
  if (!clientId)
    return Response.json(
      { error: "LinkedIn client ID (AUTH_LINKEDIN_ID) not configured" },
      { status: 500 }
    );

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/linkedin/callback`;

  const csrfState = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("linkedin_oauth_state", csrfState, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPE,
    state: csrfState,
  });

  return Response.redirect(
    `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  );
}
