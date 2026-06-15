import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { gmailCanSend } from "@/lib/inbox/gmail";
import {
  igHasScope,
  IG_COMMENTS_SCOPE,
  IG_MESSAGES_SCOPE,
} from "@/lib/oauth/instagram";
import InboxTabs from "./inbox-tabs";

async function InboxData() {
  const { userId } = await auth();

  let tiktok = { connected: false, hasCommentScope: false };
  let gmail = { connected: false, canSend: false };
  let instagram = { connected: false, canComments: false, canMessages: false };

  if (userId) {
    const accounts = await prisma.account.findMany({
      where: { userId, provider: { in: ["tiktok", "gmail", "instagram"] } },
      select: { provider: true, scope: true },
    });

    const tt = accounts.find((a: { provider: string }) => a.provider === "tiktok");
    if (tt) {
      const scopes = ((tt as { scope?: string | null }).scope ?? "").split(",");
      tiktok = {
        connected: true,
        hasCommentScope:
          scopes.includes("comment.list.manage") ||
          scopes.includes("comment.list"),
      };
    }

    const gm = accounts.find((a: { provider: string }) => a.provider === "gmail");
    if (gm) {
      gmail = { connected: true, canSend: gmailCanSend((gm as { scope?: string | null }).scope) };
    }

    const ig = accounts.find((a: { provider: string }) => a.provider === "instagram");
    if (ig) {
      instagram = {
        connected: true,
        canComments: igHasScope((ig as { scope?: string | null }).scope, IG_COMMENTS_SCOPE),
        canMessages: igHasScope((ig as { scope?: string | null }).scope, IG_MESSAGES_SCOPE),
      };
    }
  }

  return <InboxTabs tiktok={tiktok} gmail={gmail} instagram={instagram} />;
}

function InboxSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-6 border-b border-[#E8E8E8] mb-6">
        {["Gmail", "Instagram", "TikTok"].map((t) => (
          <div key={t} className="h-4 w-16 rounded bg-[#F4F4F4] mb-3" />
        ))}
      </div>
      <div className="border border-[#E8E8E8] rounded overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`flex items-center gap-4 px-5 py-[15px] ${i < 5 ? "border-b border-[#E8E8E8]" : ""}`}>
            <div className="h-4 w-32 rounded bg-[#E8E8E8] shrink-0" />
            <div className="flex-1 h-4 rounded bg-[#F4F4F4]" />
            <div className="h-3 w-8 rounded bg-[#F4F4F4] shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Inbox() {
  return (
    <>
      <div className="mb-11">
        <h1 className="font-[family-name:var(--font-jetbrains-mono)] text-[21px] font-medium tracking-[-0.02em]">
          Inbox
        </h1>
        <p className="mt-1.5 text-sm text-[#5A5A5A]">
          Read and reply across your connected accounts.
        </p>
      </div>

      <Suspense fallback={<InboxSkeleton />}>
        <InboxData />
      </Suspense>
    </>
  );
}
