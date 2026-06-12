import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { publishToPlatforms } from "@/lib/publish";

export const maxDuration = 300;

// Publishes due scheduled posts. Invoked by Vercel Cron (see vercel.json);
// protected by CRON_SECRET so it can't be triggered by strangers.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const due = await prisma.post.findMany({
    where: { status: "scheduled", scheduledAt: { lte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    take: 10,
  });

  const published: string[] = [];
  for (const post of due) {
    // Claim the post first so overlapping cron runs don't double-publish.
    const claimed = await prisma.post.updateMany({
      where: { id: post.id, status: "scheduled" },
      data: { status: "publishing" },
    });
    if (claimed.count === 0) continue;

    let platforms: string[] = [];
    try {
      platforms = JSON.parse(post.platforms);
    } catch {
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "published", results: JSON.stringify({}) },
      });
      continue;
    }

    const results = await publishToPlatforms(
      post.userId,
      post.content,
      post.mediaUrl ?? undefined,
      (post.mediaType as "image" | "video" | null) ?? undefined,
      platforms
    );

    await prisma.post.update({
      where: { id: post.id },
      data: { status: "published", results: JSON.stringify(results) },
    });
    published.push(post.id);
  }

  return Response.json({ published: published.length });
}
