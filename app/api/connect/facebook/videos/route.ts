import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const GRAPH_VERSION = "v23.0";

// Fields to request from a Page's feed.
const FEED_FIELDS = [
  "id",
  "message",
  "created_time",
  "permalink_url",
  "full_picture",
  "likes.summary(true)",
  "comments.summary(true)",
].join(",");

// Returns the posts from the user's first managed Facebook Page, mapped into
// the same shape the connections UI uses for TikTok videos.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "facebook" },
  });
  if (!account || !account.access_token)
    return Response.json(
      { error: "Facebook account not connected" },
      { status: 404 }
    );

  const now = Math.floor(Date.now() / 1000);
  if (account.expires_at && account.expires_at <= now) {
    return Response.json(
      { error: "Session expired — please reconnect Facebook." },
      { status: 401 }
    );
  }

  // Find the first Page the user manages and its page-scoped token.
  const pagesRes = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/me/accounts?` +
      new URLSearchParams({
        fields: "id,name,access_token",
        access_token: account.access_token,
      }).toString()
  );
  const pagesData = await pagesRes.json();
  if (!pagesRes.ok || pagesData.error) {
    console.error("Facebook /me/accounts error:", JSON.stringify(pagesData));
    return Response.json(
      { error: pagesData.error?.message || "Could not load Facebook Pages" },
      { status: 502 }
    );
  }

  const page = pagesData.data?.[0];
  if (!page)
    return Response.json(
      { error: "No Facebook Page found — posts require a Page." },
      { status: 404 }
    );

  const feedRes = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${page.id}/feed?` +
      new URLSearchParams({
        fields: FEED_FIELDS,
        limit: "20",
        access_token: page.access_token,
      }).toString()
  );
  const feedData = await feedRes.json();
  if (!feedRes.ok || feedData.error) {
    console.error("Facebook feed error:", JSON.stringify(feedData));
    return Response.json(
      { error: feedData.error?.message || "Could not load Facebook posts" },
      { status: 502 }
    );
  }

  type FbPost = {
    id: string;
    message?: string;
    created_time?: string;
    permalink_url?: string;
    full_picture?: string;
    likes?: { summary?: { total_count?: number } };
    comments?: { summary?: { total_count?: number } };
  };

  const videos = (feedData.data ?? []).map((p: FbPost) => ({
    id: p.id,
    title: p.message,
    video_description: p.message,
    cover_image_url: p.full_picture,
    share_url: p.permalink_url,
    create_time: p.created_time ? Math.floor(Date.parse(p.created_time) / 1000) : undefined,
    like_count: p.likes?.summary?.total_count,
    comment_count: p.comments?.summary?.total_count,
  }));

  return Response.json({ videos, cursor: null, hasMore: false });
}
