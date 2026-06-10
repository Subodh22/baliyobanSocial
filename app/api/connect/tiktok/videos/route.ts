import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// Fields to request from TikTok's video.list endpoint.
const VIDEO_FIELDS = [
  "id",
  "title",
  "video_description",
  "cover_image_url",
  "share_url",
  "create_time",
  "duration",
  "like_count",
  "comment_count",
  "view_count",
].join(",");

// Refreshes an expired TikTok access token and persists the new credentials.
async function refreshAccessToken(account: {
  id: string;
  refresh_token: string | null;
}): Promise<string | null> {
  if (!account.refresh_token) return null;

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.AUTH_TIKTOK_ID!,
      client_secret: process.env.AUTH_TIKTOK_SECRET!,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error || !data.access_token) {
    console.error("TikTok token refresh failed:", JSON.stringify(data));
    return null;
  }

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? account.refresh_token,
      expires_at: data.expires_in
        ? Math.floor(Date.now() / 1000) + data.expires_in
        : null,
    },
  });

  return data.access_token;
}

// Returns the authenticated user's TikTok videos.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "tiktok" },
  });
  if (!account || !account.access_token)
    return Response.json(
      { error: "TikTok account not connected" },
      { status: 404 }
    );

  // Refresh the token if it has expired (or is about to, within 60s).
  let accessToken = account.access_token;
  const now = Math.floor(Date.now() / 1000);
  if (account.expires_at && account.expires_at <= now + 60) {
    const refreshed = await refreshAccessToken(account);
    if (!refreshed)
      return Response.json(
        { error: "Session expired — please reconnect TikTok." },
        { status: 401 }
      );
    accessToken = refreshed;
  }

  const res = await fetch(
    `https://open.tiktokapis.com/v2/video/list/?fields=${VIDEO_FIELDS}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_count: 20 }),
    }
  );

  const data = await res.json();

  // TikTok wraps errors in an `error` object; code "ok" means success.
  if (data.error?.code && data.error.code !== "ok") {
    console.error("TikTok video.list error:", JSON.stringify(data.error));
    return Response.json(
      { error: data.error.message || data.error.code },
      { status: 502 }
    );
  }

  return Response.json({
    videos: data.data?.videos ?? [],
    cursor: data.data?.cursor ?? null,
    hasMore: data.data?.has_more ?? false,
  });
}
