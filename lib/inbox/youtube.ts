import { freshGoogleAccessToken } from "@/lib/oauth/google";
import type { InboxItem, InboxSummary } from "./types";

type Account = {
  id: string;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: number | null;
};

function formatCount(n: string | number | undefined): string {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

// Fetches the channel's recent comments + activity and a stats summary.
export async function fetchYouTube(
  account: Account
): Promise<{ items: InboxItem[]; summary: InboxSummary | null }> {
  const token = await freshGoogleAccessToken(account);
  if (!token) throw new Error("YouTube session expired — please reconnect.");
  const authHeader = { Authorization: `Bearer ${token}` };

  // Channel id + stats.
  const chRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    { headers: authHeader }
  );
  const chData = await chRes.json();
  if (!chRes.ok || chData.error)
    throw new Error(chData.error?.message || "Could not load YouTube channel");

  const channel = chData.items?.[0];
  if (!channel) return { items: [], summary: null };

  const channelId: string = channel.id;
  const stats = channel.statistics ?? {};
  const summary: InboxSummary = {
    source: "youtube",
    label: channel.snippet?.title ?? "Your channel",
    stats: [
      { label: "Subscribers", value: formatCount(stats.subscriberCount) },
      { label: "Views", value: formatCount(stats.viewCount) },
      { label: "Videos", value: formatCount(stats.videoCount) },
    ],
  };

  const items: InboxItem[] = [];

  // Recent comments across the channel's videos.
  const commentsRes = await fetch(
    "https://www.googleapis.com/youtube/v3/commentThreads?" +
      new URLSearchParams({
        part: "snippet",
        allThreadsRelatedToChannelId: channelId,
        maxResults: "15",
        order: "time",
      }).toString(),
    { headers: authHeader }
  );
  const commentsData = await commentsRes.json();
  // Comments can be disabled — don't fail the whole feed if so.
  if (commentsRes.ok && !commentsData.error) {
    for (const thread of commentsData.items ?? []) {
      const c = thread.snippet?.topLevelComment?.snippet;
      if (!c) continue;
      const videoId = thread.snippet?.videoId;
      items.push({
        id: thread.id,
        source: "youtube",
        kind: "comment",
        author: c.authorDisplayName ?? "Someone",
        title: "commented on your video",
        snippet: c.textOriginal ?? c.textDisplay ?? "",
        timestamp: c.publishedAt
          ? Math.floor(Date.parse(c.publishedAt) / 1000)
          : Math.floor(Date.now() / 1000),
        url: videoId ? `https://www.youtube.com/watch?v=${videoId}&lc=${thread.id}` : undefined,
      });
    }
  }

  // Recent channel activity (uploads, etc.).
  const actRes = await fetch(
    "https://www.googleapis.com/youtube/v3/activities?" +
      new URLSearchParams({ part: "snippet,contentDetails", mine: "true", maxResults: "10" }).toString(),
    { headers: authHeader }
  );
  const actData = await actRes.json();
  if (actRes.ok && !actData.error) {
    for (const act of actData.items ?? []) {
      const s = act.snippet;
      if (!s) continue;
      const videoId = act.contentDetails?.upload?.videoId;
      items.push({
        id: act.id ?? `${s.type}-${s.publishedAt}`,
        source: "youtube",
        kind: "activity",
        author: s.channelTitle ?? "Your channel",
        title: s.type === "upload" ? "New video published" : s.type,
        snippet: s.title ?? "",
        timestamp: s.publishedAt
          ? Math.floor(Date.parse(s.publishedAt) / 1000)
          : Math.floor(Date.now() / 1000),
        url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined,
      });
    }
  }

  return { items, summary };
}
