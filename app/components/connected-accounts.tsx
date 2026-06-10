"use client";

import { useSearchParams } from "next/navigation";

type Props = {
  accounts: { provider: string; providerAccountId: string }[];
};

const PLATFORMS = [
  { provider: "tiktok", label: "TikTok", icon: "♪", connectUrl: "/api/connect/tiktok" },
  { provider: "facebook", label: "Facebook", icon: "f", connectUrl: "/api/connect/facebook" },
  { provider: "instagram", label: "Instagram", icon: "📷", connectUrl: "/api/connect/instagram" },
];

export function ConnectedAccounts({ accounts }: Props) {
  const params = useSearchParams();
  const connected = params.get("connected");
  const error = params.get("error");

  const connectedProviders = new Set(accounts.map((a) => a.provider));

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
      <h2 className="text-lg font-semibold text-zinc-200">Connected Accounts</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Connect your social media accounts to post from Social Hub.
      </p>

      {connected && (
        <div className="mt-3 rounded-lg bg-green-950/40 border border-green-500/20 px-4 py-2 text-sm text-green-400">
          Successfully connected {connected}!
        </div>
      )}
      {error && (
        <div className="mt-3 rounded-lg bg-red-950/40 border border-red-500/20 px-4 py-2 text-sm text-red-400">
          Connection failed: {decodeURIComponent(error)}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {PLATFORMS.map((p) => {
          const isConnected = connectedProviders.has(p.provider);
          return (
            <div
              key={p.provider}
              className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{p.icon}</span>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{p.label}</p>
                  <p className="text-xs text-zinc-500">
                    {isConnected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              {isConnected ? (
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                  Active
                </span>
              ) : (
                <a
                  href={p.connectUrl}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
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
