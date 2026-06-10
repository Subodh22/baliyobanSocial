"use client";

import { useState } from "react";

const PLATFORMS = [
  { id: "twitter", label: "Twitter / X", icon: "𝕏", color: "bg-zinc-100 text-black" },
  { id: "facebook", label: "Facebook", icon: "f", color: "bg-blue-600 text-white" },
  { id: "instagram", label: "Instagram", icon: "📷", color: "bg-gradient-to-br from-purple-600 to-pink-500 text-white" },
  { id: "linkedin", label: "LinkedIn", icon: "in", color: "bg-sky-700 text-white" },
  { id: "tiktok", label: "TikTok", icon: "♪", color: "bg-pink-600 text-white" },
  { id: "google", label: "YouTube", icon: "▶", color: "bg-red-600 text-white" },
];

export function NewConnectionButton() {
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#181818] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-100">Connect a platform</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              Select a platform to connect. Each platform requires API approval before it can be linked.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition-colors hover:border-white/10 hover:bg-white/[0.06]"
                  onClick={() => {
                    // Placeholder — OAuth flows require platform API approval
                    alert(`${p.label} connection is pending API approval. Check back soon!`);
                  }}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${p.color}`}>
                    {p.icon}
                  </span>
                  <span className="text-sm font-medium text-zinc-200">{p.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-zinc-600">
              OAuth flows are pending platform review.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
