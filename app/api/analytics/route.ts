import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

type PlatformResult = { ok?: boolean; url?: string; error?: string };

// Aggregates the user's posting history from the Post table: totals, a
// per-platform breakdown of successes/failures, and the recent posts with
// their per-platform results for the history list.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const perPlatform: Record<
    string,
    { posts: number; succeeded: number; failed: number }
  > = {};
  let succeeded = 0;
  let failed = 0;

  const recent = posts.slice(0, 25).map((post) => {
    let results: Record<string, PlatformResult> = {};
    try {
      results = post.results ? JSON.parse(post.results) : {};
    } catch {
      // Ignore malformed result JSON from older rows.
    }
    return {
      id: post.id,
      content: post.content,
      mediaUrl: post.mediaUrl,
      createdAt: post.createdAt.toISOString(),
      status: post.status,
      scheduledAt: post.scheduledAt?.toISOString() ?? null,
      results,
    };
  });

  for (const post of posts) {
    let results: Record<string, PlatformResult> = {};
    try {
      results = post.results ? JSON.parse(post.results) : {};
    } catch {
      continue;
    }
    for (const [platform, r] of Object.entries(results)) {
      perPlatform[platform] ??= { posts: 0, succeeded: 0, failed: 0 };
      perPlatform[platform].posts += 1;
      if (r.ok) {
        perPlatform[platform].succeeded += 1;
        succeeded += 1;
      } else {
        perPlatform[platform].failed += 1;
        failed += 1;
      }
    }
  }

  return Response.json({
    totals: { posts: posts.length, succeeded, failed },
    perPlatform,
    recent,
  });
}
