"use client";

import { useSearchParams } from "next/navigation";

type Props = {
  accounts: { provider: string; providerAccountId: string }[];
};

const PLATFORMS = [
  { provider: "tiktok", label: "TikTok", icon: "♪", connectUrl: "/api/connect/tiktok" },
  { provider: "facebook", label: "Facebook", icon: "f", connectUrl: "/api/connect/facebook" },
  { provider: "instagram", label: "Instagram", icon: "📷", connectUrl: "/api/connect/instagram" },
  { provider: "google", label: "YouTube", icon: "▶", connectUrl: "/api/connect/google" },
  { provider: "gmail", label: "Gmail", icon: "✉", connectUrl: "/api/connect/gmail" },
  { provider: "slack", label: "Slack", icon: "#", connectUrl: "/api/connect/slack" },
  { provider: "twitter", label: "Twitter / X", icon: "𝕏", connectUrl: "/api/connect/twitter" },
  { provider: "linkedin", label: "LinkedIn", icon: "in", connectUrl: "/api/connect/linkedin" },
];

export function ConnectedAccounts({ accounts }: Props) {
  const params = useSearchParams();
  const connected = params.get("connected");
  const error = params.get("error");

  const connectedProviders = new Set(accounts.map((a) => a.provider));

  return (
    <div>
      <div className="flex items-baseline justify-between mb-[18px]">
        <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.04em] text-[#969696]">Connected accounts</span>
      </div>

      {connected && (
        <div className="mb-3 rounded border border-[#1F7A4D]/20 bg-green-50 px-4 py-2 text-sm text-[#1F7A4D]">
          Successfully connected {connected}!
        </div>
      )}
      {error && (
        <div className="mb-3 rounded border border-[#CC2A1E]/20 bg-red-50 px-4 py-2 text-sm text-[#CC2A1E]">
          Connection failed: {decodeURIComponent(error)}
        </div>
      )}

      <div className="border border-[#E8E8E8] rounded overflow-hidden">
        {PLATFORMS.map((p, i) => {
          const isConnected = connectedProviders.has(p.provider);
          return (
            <div
              key={p.provider}
              className={`flex items-center gap-4 px-5 py-[18px] transition-colors hover:bg-[#F6F6F6] ${
                i < PLATFORMS.length - 1 ? "border-b border-[#E8E8E8]" : ""
              }`}
            >
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded bg-[#0A0A0A] text-white text-sm font-bold shrink-0">
                {p.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0A0A0A]">{p.label}</p>
                <p className="text-[13px] text-[#969696] font-[family-name:var(--font-jetbrains-mono)]">
                  {isConnected ? "Connected" : "Not connected"}
                </p>
              </div>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-[450] text-[#1F7A4D]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1F7A4D]" />
                  Active
                </span>
              ) : (
                <a
                  href={p.connectUrl}
                  className="rounded border border-[#DEDEDE] bg-white px-[15px] py-[6px] text-xs font-[450] text-[#0A0A0A] transition-colors hover:bg-[#F6F6F6]"
                >
                  Connect
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
