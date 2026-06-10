import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// Resolves the current Instagram access token, refreshing if needed.
async function getAccessToken(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "instagram" },
  });
  if (!account?.access_token) return null;

  let accessToken = account.access_token;
  const now = Math.floor(Date.now() / 1000);

  if (account.expires_at && account.expires_at <= now + 86400) {
    const res = await fetch(
      "https://graph.instagram.com/refresh_access_token?" +
        new URLSearchParams({
          grant_type: "ig_refresh_token",
          access_token: account.access_token,
        }).toString()
    );
    const data = await res.json();
    if (!res.ok || data.error || !data.access_token) return null;

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
    accessToken = data.access_token;
  }

  return accessToken;
}

// GET /api/connect/instagram/comments?mediaId=<id>
// Returns comments (with replies) for a given Instagram media object.
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const mediaId = req.nextUrl.searchParams.get("mediaId");
  if (!mediaId)
    return Response.json({ error: "mediaId is required" }, { status: 400 });

  const accessToken = await getAccessToken(userId);
  if (!accessToken)
    return Response.json(
      { error: "Instagram account not connected" },
      { status: 404 }
    );

  const fields = "id,text,timestamp,username,like_count,replies{id,text,timestamp,username}";

  const res = await fetch(
    `https://graph.instagram.com/${mediaId}/comments?` +
      new URLSearchParams({
        fields,
        limit: "50",
        access_token: accessToken,
      }).toString()
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    console.error("Instagram comments error:", JSON.stringify(data));
    return Response.json(
      { error: data.error?.message || "Could not load comments" },
      { status: 502 }
    );
  }

  return Response.json({ comments: data.data ?? [] });
}

// POST /api/connect/instagram/comments
// Body: { mediaId: string, text: string, commentId?: string }
// If commentId is provided, replies to that comment; otherwise posts a
// top-level comment on the media.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { mediaId, text, commentId } = body as {
    mediaId?: string;
    text?: string;
    commentId?: string;
  };

  if (!text?.trim())
    return Response.json({ error: "text is required" }, { status: 400 });
  if (!mediaId && !commentId)
    return Response.json(
      { error: "mediaId or commentId is required" },
      { status: 400 }
    );

  const accessToken = await getAccessToken(userId);
  if (!accessToken)
    return Response.json(
      { error: "Instagram account not connected" },
      { status: 404 }
    );

  // Reply to a specific comment or post a top-level comment on the media.
  const targetId = commentId ?? mediaId;
  const endpoint = commentId ? "replies" : "comments";

  const res = await fetch(
    `https://graph.instagram.com/${targetId}/${endpoint}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        message: text.trim(),
        access_token: accessToken,
      }),
    }
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    console.error("Instagram comment post error:", JSON.stringify(data));
    return Response.json(
      { error: data.error?.message || "Could not post comment" },
      { status: 502 }
    );
  }

  return Response.json({ id: data.id });
}
