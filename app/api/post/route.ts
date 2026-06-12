import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { ensureUser } from "@/lib/user";
import { publishToPlatforms } from "@/lib/publish";

// Publishing can involve downloading and re-uploading video to platforms,
// which easily exceeds the default serverless timeout.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Keep a Prisma User row for the FK on Post.
  await ensureUser();

  const { content, mediaUrl, mediaType, platforms, scheduledAt } =
    (await req.json()) as {
      content: string;
      mediaUrl?: string;
      mediaType?: "image" | "video";
      platforms: string[];
      scheduledAt?: string;
    };

  if (!content?.trim())
    return Response.json({ error: "Content is required" }, { status: 400 });
  if (!platforms?.length)
    return Response.json({ error: "Select at least one platform" }, { status: 400 });

  // Simple abuse guard: cap post creation per user per hour. DB-backed so it
  // holds across serverless instances.
  const HOURLY_LIMIT = 30;
  const recentCount = await prisma.post.count({
    where: {
      userId,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentCount >= HOURLY_LIMIT)
    return Response.json(
      { error: `Rate limit reached (${HOURLY_LIMIT} posts/hour). Try again later.` },
      { status: 429 }
    );

  // Scheduled post: store it and let the cron publisher pick it up.
  if (scheduledAt) {
    const when = new Date(scheduledAt);
    if (isNaN(when.getTime()) || when.getTime() <= Date.now())
      return Response.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      );

    const post = await prisma.post.create({
      data: {
        userId,
        content,
        mediaUrl,
        mediaType,
        platforms: JSON.stringify(platforms),
        status: "scheduled",
        scheduledAt: when,
      },
    });
    return Response.json({ scheduled: true, id: post.id, scheduledAt: when.toISOString() });
  }

  const results = await publishToPlatforms(
    userId,
    content,
    mediaUrl,
    mediaType,
    platforms
  );

  await prisma.post.create({
    data: {
      userId,
      content,
      mediaUrl,
      mediaType,
      platforms: JSON.stringify(platforms),
      results: JSON.stringify(results),
      status: "published",
    },
  });

  return Response.json({ results });
}
