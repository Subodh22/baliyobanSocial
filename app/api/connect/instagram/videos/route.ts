import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// Fields to request from the Instagram media endpoint.
const MEDIA_FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_url",
  "thumbnail_url",
  "permalink",
  "timestamp",
  "like_count",
  "comments_count",
].join(",");

// Refreshes a long-lived Instagram token (valid ~60 days) and persists it.
async function refreshAccessToken(account: {
  id: string;
  access_token: string;
}): Promise<string | null> {
  const res = await fetch(
    "https://graph.instagram.com/refresh_access_token?" +
      new URLSearchParams({
        grant_type: "ig_refresh_token",
        access_token: account.access_token,
      }).toString()
  );
  const data = await res.json();
  if (!res.ok || data.error || !data.access_token) {
    console.error("Instagram token refresh failed:", JSON.stringify(data));
    return null;
  }

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      refresh_token: data.access_token,
      expires_at: data.expires_in
        ? Math.floor(Date.now() / 1000) + data.expires_in
        : null,
    },
  });

  return data.access_token;
}

// Returns the authenticated user's Instagram media, mapped into the same shape
// the connections UI uses for TikTok videos.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "instagram" },
  });
  if (!account || !account.access_token)
    return Response.json(
      { error: "Instagram account not connected" },
      { status: 404 }
    );

  // Refresh the token if it has expired (or is about to, within a day).
  let accessToken = account.access_token;
  const now = Math.floor(Date.now() / 1000);
  if (account.expires_at && account.expires_at <= now + 86400) {
    const refreshed = await refreshAccessToken({ id: account.id, access_token: accessToken });
    if (!refreshed)
      return Response.json(
        { error: "Session expired — please reconnect Instagram." },
        { status: 401 }
      );
    accessToken = refreshed;
  }

  const res = await fetch(
    "https://graph.instagram.com/me/media?" +
      new URLSearchParams({
        fields: MEDIA_FIELDS,
        limit: "20",
        access_token: accessToken,
      }).toString()
  );
  const data = await res.json();
  if (!res.ok || data.error) {
    console.error("Instagram media error:", JSON.stringify(data));
    return Response.json(
      { error: data.error?.message || "Could not load Instagram posts" },
      { status: 502 }
    );
  }

  type IgMedia = {
    id: string;
    caption?: string;
    media_url?: string;
    thumbnail_url?: string;
    permalink?: string;
    timestamp?: string;
    like_count?: number;
    comments_count?: number;
  };

  const videos = (data.data ?? []).map((m: IgMedia) => ({
    id: m.id,
    title: m.caption,
    video_description: m.caption,
    cover_image_url: m.thumbnail_url ?? m.media_url,
    share_url: m.permalink,
    create_time: m.timestamp ? Math.floor(Date.parse(m.timestamp) / 1000) : undefined,
    like_count: m.like_count,
    comment_count: m.comments_count,
  }));

  return Response.json({ videos, cursor: null, hasMore: false });
}
