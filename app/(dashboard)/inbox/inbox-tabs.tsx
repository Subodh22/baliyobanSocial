"use client";

import { useState } from "react";
import InboxClient from "./inbox-client";
import GmailClient from "./gmail-client";
import InstagramClient from "./instagram-client";

type TabId = "gmail" | "instagram" | "tiktok";

type Props = {
  tiktok: { connected: boolean; hasCommentScope: boolean };
  gmail: { connected: boolean; canSend: boolean };
  instagram: { connected: boolean; canComments: boolean; canMessages: boolean };
};

export default function InboxTabs({ tiktok, gmail, instagram }: Props) {
  const tabs = [
    gmail.connected && { id: "gmail" as const, label: "Gmail" },
    instagram.connected && { id: "instagram" as const, label: "Instagram" },
    tiktok.connected && { id: "tiktok" as const, label: "TikTok" },
  ].filter(Boolean) as { id: TabId; label: string }[];

  const [active, setActive] = useState<TabId>(tabs[0]?.id ?? "tiktok");

  if (tabs.length === 0) {
    return (
      <div className="flex flex-col items-center rounded border border-dashed border-[#DEDEDE] bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-[#0A0A0A]">No inbox sources connected</p>
        <p className="mt-1.5 max-w-sm text-sm text-[#5A5A5A]">
          Connect Gmail, Instagram, or TikTok to see and reply to messages here.
        </p>
        <a
          href="/dashboard"
          className="mt-6 rounded bg-[#0A0A0A] px-[15px] py-[9px] text-[13px] font-medium text-white transition-opacity hover:opacity-85"
        >
          Manage connections
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {tabs.length > 1 && (
        <div className="flex items-center gap-6 border-b border-[#E8E8E8]">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`-mb-px border-b px-0 pb-3 text-[13.5px] transition-colors ${
                active === t.id
                  ? "border-[#0A0A0A] text-[#0A0A0A] font-medium"
                  : "border-transparent text-[#969696] font-[450] hover:text-[#0A0A0A]"
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
      {active === "instagram" && instagram.connected && (
        <InstagramClient
          canComments={instagram.canComments}
          canMessages={instagram.canMessages}
        />
      )}
      {active === "tiktok" && tiktok.connected && (
        <InboxClient hasCommentScope={tiktok.hasCommentScope} />
      )}
    </div>
  );
}
