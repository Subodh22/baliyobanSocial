import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

// Redirects the user to TikTok's OAuth authorization page.
// Works with both sandbox and production TikTok apps — the sandbox
// behavior is controlled by the app's status on the TikTok Developer Portal.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const clientKey = process.env.AUTH_TIKTOK_ID;
  if (!clientKey)
    return Response.json(
      { error: "TikTok client key (AUTH_TIKTOK_ID) not configured" },
      { status: 500 }
    );

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/tiktok/callback`;

  // CSRF token stored in a cookie so the callback can verify it.
  const csrfState = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("tiktok_oauth_state", csrfState, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    // Must be a subset of the scopes enabled on the TikTok app/sandbox.
    // user.info.basic: open id, avatar, display name (Login Kit)
    // video.publish: directly post to TikTok (Content Posting API)
    // video.upload: upload as draft (Content Posting API)
    scope: "user.info.basic,video.publish,video.upload",
    redirect_uri: redirectUri,
    state: csrfState,
  });

  return Response.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  );
}
