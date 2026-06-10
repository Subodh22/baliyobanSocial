import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { fetchGmail } from "@/lib/inbox/gmail";
import { fetchYouTube } from "@/lib/inbox/youtube";
import { fetchSlack } from "@/lib/inbox/slack";
import type { InboxItem, InboxSummary } from "@/lib/inbox/types";

// Aggregates incoming items (Gmail emails, YouTube comments/activity, Slack
// messages) from every connected source into one sorted feed.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await prisma.account.findMany({
    where: { userId, provider: { in: ["gmail", "google", "slack"] } },
  });

  const items: InboxItem[] = [];
  const summaries: InboxSummary[] = [];
  const errors: { source: string; error: string }[] = [];

  // Run each source independently so one failure doesn't sink the rest.
  await Promise.all(
    accounts.map(async (account) => {
      try {
        if (account.provider === "gmail") {
          items.push(...(await fetchGmail(account)));
        } else if (account.provider === "google") {
          const { items: yt, summary } = await fetchYouTube(account);
          items.push(...yt);
          if (summary) summaries.push(summary);
        } else if (account.provider === "slack") {
          items.push(...(await fetchSlack(account)));
        }
      } catch (e) {
        errors.push({
          source: account.provider,
          error: e instanceof Error ? e.message : "Failed to load",
        });
      }
    })
  );

  items.sort((a, b) => b.timestamp - a.timestamp);

  return Response.json({ items, summaries, errors });
}
