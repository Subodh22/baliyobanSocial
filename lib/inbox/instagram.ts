import { freshInstagramAccessToken } from "@/lib/oauth/instagram";
import type { InboxItem } from "./types";

const GRAPH = "https://graph.instagram.com";

type Account = {
  id: string;
  access_token: string | null;
  expires_at: number | null;
  providerAccountId: string;
};

function ts(iso: string | undefined): number {
  return iso ? Math.floor(Date.parse(iso) / 1000) : Math.floor(Date.now() / 1000);
}

// Fetches recent comments across the account's latest media, mapped to
// InboxItems. Only pulls comments for media that report having any.
export async function fetchInstagramComments(
  token: string
): Promise<InboxItem[]> {
  const mediaRes = await fetch(
    `${GRAPH}/me/media?` +
      new URLSearchParams({
        fields:
          "id,caption,permalink,comments_count,timestamp,media_type,media_url,thumbnail_url",
        limit: "15",
        access_token: token,
      }).toString()
  );
  const mediaData = await mediaRes.json();
  if (!mediaRes.ok || mediaData.error)
    throw new Error(mediaData.error?.message || "Could not load Instagram media");

  type Media = {
    id: string;
    caption?: string;
    permalink?: string;
    comments_count?: number;
    media_url?: string;
    thumbnail_url?: string;
  };
  const media: Media[] = (mediaData.data ?? []).filter(
    (m: Media) => (m.comments_count ?? 0) > 0
  );

  const perMedia = await Promise.all(
    media.map(async (m): Promise<InboxItem[]> => {
      const comments = await fetchComments(m.id, token);
      // Videos expose a thumbnail_url; images use media_url.
      const image = m.thumbnail_url ?? m.media_url;
      return comments.map((c) => ({
        id: `igc_${c.id}`,
        source: "instagram" as const,
        kind: "comment",
        author: c.from?.username || c.username || "Instagram user",
        title: m.caption ? m.caption.slice(0, 80) : "(no caption)",
        snippet: c.text ?? "",
        timestamp: ts(c.timestamp),
        url: m.permalink,
        imageUrl: image,
      }));
    })
  );

  return perMedia.flat();
}

type IgComment = {
  id: string;
  text?: string;
  username?: string;
  from?: { id?: string; username?: string };
  timestamp?: string;
};

// Loads a media's comments, requesting the richer `from{username}` field for the
// commenter's name and falling back to the basic field set if that errors (some
// API versions reject `from` on the comment node).
async function fetchComments(
  mediaId: string,
  token: string
): Promise<IgComment[]> {
  const fieldSets = [
    "id,text,username,from{id,username},timestamp,like_count",
    "id,text,username,timestamp,like_count",
  ];
  for (const fields of fieldSets) {
    const res = await fetch(
      `${GRAPH}/${mediaId}/comments?` +
        new URLSearchParams({ fields, limit: "25", access_token: token }).toString()
    );
    const data = await res.json();
    if (res.ok && !data.error) return data.data ?? [];
  }
  return [];
}

// Fetches recent DM conversations, mapping the latest message of each to an
// InboxItem. Requires instagram_business_manage_messages.
export async function fetchInstagramDMs(
  token: string,
  selfId: string
): Promise<InboxItem[]> {
  const res = await fetch(
    `${GRAPH}/me/conversations?` +
      new URLSearchParams({
        platform: "instagram",
        fields:
          "id,updated_time,participants,messages.limit(1){id,message,from,created_time}",
        limit: "20",
        access_token: token,
      }).toString()
  );
  const data = await res.json();
  if (!res.ok || data.error)
    throw new Error(data.error?.message || "Could not load Instagram messages");

  type Participant = { id: string; username?: string };
  type Message = {
    id: string;
    message?: string;
    created_time?: string;
    from?: Participant;
  };
  type Conversation = {
    id: string;
    updated_time?: string;
    participants?: { data: Participant[] };
    messages?: { data: Message[] };
  };

  return (data.data ?? []).map((conv: Conversation): InboxItem => {
    const last = conv.messages?.data?.[0];
    // Name the conversation after the participant who isn't us.
    const other = conv.participants?.data?.find((p) => p.id !== selfId);
    return {
      id: `igdm_${conv.id}`,
      source: "instagram",
      kind: "dm",
      author: other?.username || last?.from?.username || "Instagram user",
      title: "Direct message",
      snippet: last?.message ?? "",
      timestamp: ts(last?.created_time ?? conv.updated_time),
      recipientId: other?.id,
    };
  });
}

// Loads both comments and DMs, tolerating partial failure (e.g. the account
// granted comment access but not message access).
export async function fetchInstagram(account: Account): Promise<{
  comments: InboxItem[];
  dms: InboxItem[];
  errors: { kind: string; error: string }[];
}> {
  const token = await freshInstagramAccessToken(account);
  if (!token) throw new Error("Instagram session expired — please reconnect.");

  const errors: { kind: string; error: string }[] = [];

  const [comments, dms] = await Promise.all([
    fetchInstagramComments(token).catch((e) => {
      errors.push({ kind: "comments", error: e instanceof Error ? e.message : "Failed" });
      return [] as InboxItem[];
    }),
    fetchInstagramDMs(token, account.providerAccountId).catch((e) => {
      errors.push({ kind: "dms", error: e instanceof Error ? e.message : "Failed" });
      return [] as InboxItem[];
    }),
  ]);

  comments.sort((a, b) => b.timestamp - a.timestamp);
  dms.sort((a, b) => b.timestamp - a.timestamp);
  return { comments, dms, errors };
}
