"use client";

import { useState } from "react";
import InboxClient from "./inbox-client";
import GmailClient from "./gmail-client";

type Props = {
  tiktok: { connected: boolean; hasCommentScope: boolean };
  gmail: { connected: boolean; canSend: boolean };
};

export default function InboxTabs({ tiktok, gmail }: Props) {
  const tabs = [
    gmail.connected && { id: "gmail" as const, label: "Gmail" },
    tiktok.connected && { id: "tiktok" as const, label: "TikTok" },
  ].filter(Boolean) as { id: "gmail" | "tiktok"; label: string }[];

  const [active, setActive] = useState<"gmail" | "tiktok">(
    tabs[0]?.id ?? "tiktok"
  );

  if (tabs.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
        <p className="text-sm font-medium text-zinc-300">No inbox sources connected</p>
        <p className="mt-1.5 max-w-sm text-sm text-zinc-500">
          Connect Gmail or TikTok to see and reply to messages here.
        </p>
        <a
          href="/dashboard"
          className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Manage connections
        </a>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-1 flex-col overflow-hidden">
      {tabs.length > 1 && (
        <div className="flex items-center gap-1 border-b border-white/[0.06]">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                active === t.id
                  ? "border-indigo-500 text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {active === "gmail" && gmail.connected && (
        <GmailClient canSend={gmail.canSend} />
      )}
      {active === "tiktok" && tiktok.connected && (
        <InboxClient hasCommentScope={tiktok.hasCommentScope} />
      )}
    </div>
  );
}
