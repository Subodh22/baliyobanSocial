import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import {
  listTikTokComments,
  listTikTokReplies,
  replyToTikTokComment,
} from "@/lib/platforms/tiktok-comments";

/** GET /api/comments?platform=tiktok&videoId=...&commentId=...&cursor=... */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const platform = sp.get("platform");
  const videoId = sp.get("videoId");
  const commentId = sp.get("commentId");
  const cursor = sp.get("cursor") ?? undefined;

  if (platform !== "tiktok")
    return Response.json(
      { error: "Only TikTok comments are supported right now" },
      { status: 400 }
    );

  if (!videoId)
    return Response.json({ error: "videoId is required" }, { status: 400 });

  const acc = await prisma.account.findFirst({
    where: { userId, provider: "tiktok" },
  });
  if (!acc?.access_token)
    return Response.json({ error: "TikTok not connected" }, { status: 400 });

  if (commentId) {
    const result = await listTikTokReplies(
      acc.access_token,
      videoId,
      commentId,
      cursor
    );
    return Response.json(result);
  }

  const result = await listTikTokComments(acc.access_token, videoId, cursor);
  return Response.json(result);
}

/** POST /api/comments — reply to a comment */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { platform, videoId, commentId, text } = (await req.json()) as {
    platform: string;
    videoId: string;
    commentId: string;
    text: string;
  };

  if (platform !== "tiktok")
    return Response.json(
      { error: "Only TikTok comments are supported right now" },
      { status: 400 }
    );

  if (!videoId || !commentId || !text?.trim())
    return Response.json(
      { error: "videoId, commentId and text are required" },
      { status: 400 }
    );

  const acc = await prisma.account.findFirst({
    where: { userId, provider: "tiktok" },
  });
  if (!acc?.access_token)
    return Response.json({ error: "TikTok not connected" }, { status: 400 });

  const result = await replyToTikTokComment(
    acc.access_token,
    videoId,
    commentId,
    text
  );
  return Response.json(result);
}
