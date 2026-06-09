// TikTok Comment API helpers
// Docs: https://developers.tiktok.com/doc/content-posting-api-reference-get-comments

const BASE = "https://open.tiktokapis.com/v2";

export type TikTokComment = {
  id: string;
  text: string;
  create_time: number;
  likes: number;
  replies: number;
  parent_comment_id?: string;
  user: { display_name: string; avatar_url: string };
};

/** Fetch top-level comments for a video. */
export async function listTikTokComments(
  accessToken: string,
  videoId: string,
  cursor?: string
): Promise<{
  ok: boolean;
  comments?: TikTokComment[];
  cursor?: string;
  hasMore?: boolean;
  error?: string;
}> {
  const body: Record<string, unknown> = {
    video_id: videoId,
    max_count: 20,
  };
  if (cursor) body.cursor = cursor;

  const res = await fetch(`${BASE}/comment/list/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      ok: false,
      error: err.error?.message ?? `Failed to list comments (${res.status})`,
    };
  }

  const data = await res.json();
  return {
    ok: true,
    comments: data.data?.comments ?? [],
    cursor: data.data?.cursor,
    hasMore: data.data?.has_more ?? false,
  };
}

/** Fetch replies to a specific comment. */
export async function listTikTokReplies(
  accessToken: string,
  videoId: string,
  commentId: string,
  cursor?: string
): Promise<{
  ok: boolean;
  comments?: TikTokComment[];
  cursor?: string;
  hasMore?: boolean;
  error?: string;
}> {
  const body: Record<string, unknown> = {
    video_id: videoId,
    comment_id: commentId,
    max_count: 20,
  };
  if (cursor) body.cursor = cursor;

  const res = await fetch(`${BASE}/comment/reply/list/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      ok: false,
      error: err.error?.message ?? `Failed to list replies (${res.status})`,
    };
  }

  const data = await res.json();
  return {
    ok: true,
    comments: data.data?.comments ?? [],
    cursor: data.data?.cursor,
    hasMore: data.data?.has_more ?? false,
  };
}

/** Reply to a comment on a TikTok video. */
export async function replyToTikTokComment(
  accessToken: string,
  videoId: string,
  commentId: string,
  text: string
): Promise<{ ok: boolean; commentId?: string; error?: string }> {
  if (!text.trim()) return { ok: false, error: "Reply text is required" };

  const res = await fetch(`${BASE}/comment/reply/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      video_id: videoId,
      comment_id: commentId,
      text: text.slice(0, 150),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      ok: false,
      error: err.error?.message ?? `Failed to reply (${res.status})`,
    };
  }

  const data = await res.json();
  return { ok: true, commentId: data.data?.comment_id };
}
