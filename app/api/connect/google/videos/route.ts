import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { freshGoogleAccessToken } from "@/lib/oauth/google";

const YT_API = "https://www.googleapis.com/youtube/v3";

// Returns the authenticated user's YouTube videos, mapped into the same shape
// the connections UI uses for TikTok / Facebook / Instagram posts.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!account || !account.access_token)
    return Response.json(
      { error: "YouTube account not connected" },
      { status: 404 }
    );

  const accessToken = await freshGoogleAccessToken(account);
  if (!accessToken)
    return Response.json(
      { error: "Session expired — please reconnect YouTube." },
      { status: 401 }
    );

  const headers = { Authorization: `Bearer ${accessToken}` };

  // 1. Get the channel's "uploads" playlist ID.
  const chRes = await fetch(
    `${YT_API}/channels?` +
      new URLSearchParams({ part: "contentDetails", mine: "true" }).toString(),
    { headers }
  );
  const chData = await chRes.json();
  if (!chRes.ok || chData.error) {
    console.error("YouTube channels error:", JSON.stringify(chData));
    return Response.json(
      { error: chData.error?.message || "Could not load YouTube channel" },
      { status: 502 }
    );
  }

  const uploadsPlaylistId =
    chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId)
    return Response.json({ videos: [], cursor: null, hasMore: false });

  // 2. List the most recent uploads.
  const plRes = await fetch(
    `${YT_API}/playlistItems?` +
      new URLSearchParams({
        part: "snippet",
        playlistId: uploadsPlaylistId,
        maxResults: "20",
      }).toString(),
    { headers }
  );
  const plData = await plRes.json();
  if (!plRes.ok || plData.error) {
    console.error("YouTube playlistItems error:", JSON.stringify(plData));
    return Response.json(
      { error: plData.error?.message || "Could not load YouTube videos" },
      { status: 502 }
    );
  }

  const items: Array<{
    snippet: {
      resourceId?: { videoId?: string };
      title?: string;
      description?: string;
      thumbnails?: Record<string, { url?: string }>;
      publishedAt?: string;
    };
  }> = plData.items ?? [];

  if (items.length === 0)
    return Response.json({ videos: [], cursor: null, hasMore: false });

  // 3. Fetch statistics for those video IDs in one batch call.
  const videoIds = items
    .map((i) => i.snippet?.resourceId?.videoId)
    .filter(Boolean) as string[];

  const statsMap: Record<
    string,
    { viewCount?: string; likeCount?: string; commentCount?: string }
  > = {};

  if (videoIds.length > 0) {
    const vRes = await fetch(
      `${YT_API}/videos?` +
        new URLSearchParams({
          part: "statistics",
          id: videoIds.join(","),
        }).toString(),
      { headers }
    );
    const vData = await vRes.json();
    if (vRes.ok && !vData.error) {
      for (const v of vData.items ?? []) {
        statsMap[v.id] = v.statistics ?? {};
      }
    }
  }

  const videos = items.map((item) => {
    const s = item.snippet;
    const videoId = s?.resourceId?.videoId;
    const stats = videoId ? statsMap[videoId] : undefined;
    const thumb =
      s?.thumbnails?.high ?? s?.thumbnails?.medium ?? s?.thumbnails?.default;

    return {
      id: videoId ?? "",
      title: s?.title,
      video_description: s?.description,
      cover_image_url: thumb?.url,
      share_url: videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : undefined,
      create_time: s?.publishedAt
        ? Math.floor(Date.parse(s.publishedAt) / 1000)
        : undefined,
      view_count: stats?.viewCount ? Number(stats.viewCount) : undefined,
      like_count: stats?.likeCount ? Number(stats.likeCount) : undefined,
      comment_count: stats?.commentCount
        ? Number(stats.commentCount)
        : undefined,
    };
  });

  return Response.json({
    videos,
    cursor: plData.nextPageToken ?? null,
    hasMore: Boolean(plData.nextPageToken),
  });
}
