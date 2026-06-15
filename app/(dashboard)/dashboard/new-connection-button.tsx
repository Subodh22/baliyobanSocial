"use client";

import { useState } from "react";

const PLATFORMS = [
  { id: "twitter",   label: "Twitter / X", icon: "𝕏" },
  { id: "facebook",  label: "Facebook",    icon: "f" },
  { id: "instagram", label: "Instagram",   icon: "📷" },
  { id: "linkedin",  label: "LinkedIn",    icon: "in" },
  { id: "tiktok",    label: "TikTok",      icon: "♪" },
  { id: "google",    label: "YouTube",     icon: "▶" },
  { id: "gmail",     label: "Gmail",       icon: "✉" },
];

export default function NewConnectionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[13px] text-[#0A0A0A] font-[450] inline-flex items-center gap-[5px] border-b border-[#0A0A0A] transition-opacity hover:opacity-55"
      >
        Add account
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[13px] w-[13px]">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded border border-[#E8E8E8] bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-medium text-[#0A0A0A]">Connect a platform</h2>
            <p className="mt-1 text-sm text-[#5A5A5A]">
              Select a social platform to connect to your account.
            </p>

            <div className="mt-5 border border-[#E8E8E8] rounded overflow-hidden">
              {PLATFORMS.map((p, i) => (
                <button
                  key={p.id}
                  className={`flex w-full items-center gap-4 px-5 py-[14px] text-left transition-colors hover:bg-[#F6F6F6] ${
                    i < PLATFORMS.length - 1 ? "border-b border-[#E8E8E8]" : ""
                  }`}
                  onClick={() => {
                    window.open(
                      `/api/connect/${p.id}`,
                      "_blank",
                      "width=600,height=700"
                    );
                    setOpen(false);
                  }}
                >
                  <span className="flex h-[34px] w-[34px] items-center justify-center rounded bg-[#0A0A0A] text-white text-sm font-bold">
                    {p.icon}
                  </span>
                  <span className="text-sm font-medium text-[#0A0A0A]">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded border border-[#DEDEDE] px-4 py-[9px] text-[13px] font-[450] text-[#5A5A5A] transition-colors hover:bg-[#F6F6F6] hover:text-[#0A0A0A]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
