"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ManageButton from "./manage-button";

export default function ConnectionActions({ provider }: { provider: string }) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Providers with connect/disconnect endpoints wired up.
  const supported = ["tiktok", "facebook", "instagram", "google", "gmail"].includes(provider);

  async function disconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch(`/api/connect/${provider}/disconnect`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Disconnect failed");
      }
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Disconnect failed");
      setDisconnecting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <ManageButton provider={provider} />

      {supported && (
        <>
          <a
            href={`/api/connect/${provider}`}
            className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Reconnect
          </a>

          {confirming ? (
            <span className="flex items-center gap-2 text-xs">
              <button
                onClick={disconnect}
                disabled={disconnecting}
                className="font-medium text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
              >
                {disconnecting ? "Removing…" : "Confirm"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={disconnecting}
                className="text-zinc-500 transition-colors hover:text-zinc-300"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-xs text-zinc-500 transition-colors hover:text-red-400"
            >
              Disconnect
            </button>
          )}
        </>
      )}
    </div>
  );
}
