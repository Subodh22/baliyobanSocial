import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTikTokAccount } from "@/lib/platforms/tiktok-auth";

const COMMENT_FIELDS = [
  "id",
  "video_id",
  "text",
  "likes",
  "reply_count",
  "parent_comment_id",
  "create_time",
].join(",");

// Returns comments for a given TikTok video.
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const videoId = req.nextUrl.searchParams.get("video_id");
  if (!videoId)
    return Response.json(
      { error: "video_id is required" },
      { status: 400 }
    );

  const result = await getTikTokAccount(userId);
  if ("error" in result)
    return Response.json({ error: result.error }, { status: result.status });

  const { accessToken, account } = result;

  // Check that the comment scope was granted.
  const grantedScopes = (account.scope ?? "").split(",");
  if (
    !grantedScopes.includes("comment.list.manage") &&
    !grantedScopes.includes("comment.list")
  ) {
    return Response.json(
      {
        error:
          "Comment permissions not granted. Please reconnect TikTok.",
        needsReconnect: true,
      },
      { status: 403 }
    );
  }

  const cursor = req.nextUrl.searchParams.get("cursor");
  const body: Record<string, unknown> = {
    video_id: videoId,
    max_count: 50,
  };
  if (cursor) body.cursor = Number(cursor);

  const res = await fetch(
    `https://open.tiktokapis.com/v2/comment/list/?fields=${COMMENT_FIELDS}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  if (data.error?.code && data.error.code !== "ok") {
    console.error("TikTok comment.list error:", JSON.stringify(data.error));
    return Response.json(
      { error: data.error.message || data.error.code },
      { status: 502 }
    );
  }

  return Response.json({
    comments: data.data?.comments ?? [],
    cursor: data.data?.cursor ?? null,
    hasMore: data.data?.has_more ?? false,
  });
}
