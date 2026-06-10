import { auth } from "@clerk/nextjs/server";
import { getTikTokAccount } from "@/lib/platforms/tiktok-auth";

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

// Returns the authenticated user's TikTok videos.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getTikTokAccount(userId);
  if ("error" in result)
    return Response.json({ error: result.error }, { status: result.status });

  const { accessToken, account } = result;

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
    // On a scope error, report the scopes the token actually carries so it's
    // clear whether video.list was granted during authorization.
    const isScopeError = data.error.code === "scope_not_authorized";
    const grantedScope = account.scope ?? "(none recorded)";
    return Response.json(
      {
        error: isScopeError
          ? `${data.error.message || data.error.code} — token was granted: ${grantedScope}`
          : data.error.message || data.error.code,
        grantedScope,
      },
      { status: 502 }
    );
  }

  return Response.json({
    videos: data.data?.videos ?? [],
    cursor: data.data?.cursor ?? null,
    hasMore: data.data?.has_more ?? false,
  });
}
