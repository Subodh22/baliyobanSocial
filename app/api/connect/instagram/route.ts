import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

// Redirects the user to Instagram's OAuth page using the "Instagram API with
// Instagram Login" flow (api.instagram.com) — a direct login that does NOT go
// through a Facebook Page. Requires an Instagram Business or Creator account.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = process.env.AUTH_INSTAGRAM_ID;
  if (!clientId)
    return Response.json(
      { error: "Instagram app ID (AUTH_INSTAGRAM_ID) not configured" },
      { status: 500 }
    );

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/connect/instagram/callback`;

  // CSRF token stored in a cookie so the callback can verify it.
  const csrfState = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("instagram_oauth_state", csrfState, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "instagram_business_basic,instagram_business_content_publish",
    redirect_uri: redirectUri,
    state: csrfState,
  });

  return Response.redirect(
    `https://api.instagram.com/oauth/authorize?${params.toString()}`
  );
}
