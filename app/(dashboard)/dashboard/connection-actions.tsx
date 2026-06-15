"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ManageButton from "./manage-button";

export default function ConnectionActions({ provider }: { provider: string }) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const supported = [
    "tiktok",
    "facebook",
    "instagram",
    "google",
    "gmail",
    "twitter",
    "linkedin",
    "slack",
  ].includes(provider);

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
    <div className="flex items-center gap-1">
      <ManageButton provider={provider} />

      {supported && (
        <>
          <a
            href={`/api/connect/${provider}`}
            className="text-[13px] text-[#5A5A5A] font-[450] px-[10px] py-[6px] rounded transition-colors hover:bg-[#EDEDED] hover:text-[#0A0A0A]"
          >
            Reconnect
          </a>

          {confirming ? (
            <span className="flex items-center gap-2 text-[13px]">
              <button
                onClick={disconnect}
                disabled={disconnecting}
                className="font-medium text-[#CC2A1E] transition-colors hover:opacity-70 disabled:opacity-50"
              >
                {disconnecting ? "Removing…" : "Confirm"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={disconnecting}
                className="text-[#969696] transition-colors hover:text-[#0A0A0A]"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-[13px] text-[#5A5A5A] font-[450] px-[10px] py-[6px] rounded transition-colors hover:text-[#CC2A1E] hover:bg-[#EDEDED]"
            >
              Disconnect
            </button>
          )}
        </>
      )}
    </div>
  );
}
