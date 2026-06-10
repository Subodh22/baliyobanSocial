import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import InboxClient from "./inbox-client";

export default async function Inbox() {
  const { userId } = await auth();

  let hasCommentScope = false;
  if (userId) {
    const account = await prisma.account.findFirst({
      where: { userId, provider: "tiktok" },
      select: { scope: true },
    });
    if (account?.scope) {
      const scopes = account.scope.split(",");
      hasCommentScope =
        scopes.includes("comment.list.manage") ||
        scopes.includes("comment.list");
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Inbox
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Comments and engagement across your TikTok posts
          </p>
        </div>
      </div>

      <InboxClient hasCommentScope={hasCommentScope} />
    </>
  );
}
