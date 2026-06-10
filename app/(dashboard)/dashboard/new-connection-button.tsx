"use client";

import { useState } from "react";

const PLATFORMS = [
  { id: "twitter",   label: "Twitter / X", icon: "𝕏",  color: "bg-zinc-100 text-black" },
  { id: "facebook",  label: "Facebook",    icon: "f",   color: "bg-blue-600 text-white" },
  { id: "instagram", label: "Instagram",   icon: "📷",  color: "bg-gradient-to-br from-purple-600 via-pink-500 to-amber-400 text-white" },
  { id: "linkedin",  label: "LinkedIn",    icon: "in",  color: "bg-sky-700 text-white" },
  { id: "tiktok",    label: "TikTok",      icon: "♪",   color: "bg-pink-600 text-white" },
  { id: "google",    label: "YouTube",     icon: "▶",   color: "bg-red-600 text-white" },
  { id: "gmail",     label: "Gmail",       icon: "✉",   color: "bg-white text-red-600" },
];

export default function NewConnectionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        + New Connection
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#181818] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-zinc-100">Connect a platform</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Select a social platform to connect to your account.
            </p>

            <div className="mt-5 space-y-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-white/10 hover:bg-white/[0.06]"
                  onClick={() => {
                    // OAuth flow will be wired here per-platform
                    window.open(
                      `/api/connect/${p.id}`,
                      "_blank",
                      "width=600,height=700"
                    );
                    setOpen(false);
                  }}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${p.color}`}
                  >
                    {p.icon}
                  </span>
                  <span className="text-sm font-medium text-zinc-200">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
