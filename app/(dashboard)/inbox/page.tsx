import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { gmailCanSend } from "@/lib/inbox/gmail";
import {
  igHasScope,
  IG_COMMENTS_SCOPE,
  IG_MESSAGES_SCOPE,
} from "@/lib/oauth/instagram";
import InboxTabs from "./inbox-tabs";

export default async function Inbox() {
  const { userId } = await auth();

  let tiktok = { connected: false, hasCommentScope: false };
  let gmail = { connected: false, canSend: false };
  let instagram = { connected: false, canComments: false, canMessages: false };

  if (userId) {
    const accounts = await prisma.account.findMany({
      where: { userId, provider: { in: ["tiktok", "gmail", "instagram"] } },
      select: { provider: true, scope: true },
    });

    const tt = accounts.find((a) => a.provider === "tiktok");
    if (tt) {
      const scopes = (tt.scope ?? "").split(",");
      tiktok = {
        connected: true,
        hasCommentScope:
          scopes.includes("comment.list.manage") ||
          scopes.includes("comment.list"),
      };
    }

    const gm = accounts.find((a) => a.provider === "gmail");
    if (gm) {
      gmail = { connected: true, canSend: gmailCanSend(gm.scope) };
    }

    const ig = accounts.find((a) => a.provider === "instagram");
    if (ig) {
      instagram = {
        connected: true,
        canComments: igHasScope(ig.scope, IG_COMMENTS_SCOPE),
        canMessages: igHasScope(ig.scope, IG_MESSAGES_SCOPE),
      };
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
            Read and reply to messages across your connected accounts
          </p>
        </div>
      </div>

      <InboxTabs tiktok={tiktok} gmail={gmail} instagram={instagram} />
    </>
  );
}
