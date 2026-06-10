"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PROVIDERS = [
  { id: "tiktok", label: "TikTok", icon: "♪", color: "bg-pink-600 text-white", href: "/api/auth/tiktok" },
] as const;

export function NewConnectionButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        + New Connection
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-white/10 bg-[#1a1a1a] p-2 shadow-xl">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Connect a platform
            </p>
            {PROVIDERS.map((p) => (
              <a
                key={p.id}
                href={p.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-200 transition-colors hover:bg-white/[0.06]"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${p.color}`}>
                  {p.icon}
                </span>
                {p.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function DisconnectButton({ provider }: { provider: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDisconnect() {
    if (!confirm(`Disconnect ${provider}? You'll need to re-authorize to post again.`)) return;
    setLoading(true);
    try {
      await fetch("/api/auth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDisconnect}
      disabled={loading}
      className="text-xs text-zinc-600 transition-colors hover:text-red-400 disabled:opacity-50"
    >
      {loading ? "Removing..." : "Disconnect"}
    </button>
  );
}
