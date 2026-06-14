import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

const GRAPH_VERSION = "v23.0";

// Redirects the user to Facebook's OAuth (Facebook Login) authorization page.
// A single Facebook Login grants access to the user's Pages, which is what we
// list and post to.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = process.env.AUTH_FACEBOOK_ID;
  if (!clientId)
    return Response.json(
      { error: "Facebook app ID (AUTH_FACEBOOK_ID) not configured" },
      { status: 500 }
    );

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/facebook/callback`;

  // CSRF token stored in a cookie so the callback can verify it.
  const csrfState = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("facebook_oauth_state", csrfState, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement,publish_video",
    redirect_uri: redirectUri,
    state: csrfState,
  });

  return Response.redirect(
    `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`
  );
}
