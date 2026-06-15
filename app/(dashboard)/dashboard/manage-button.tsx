"use client";

import { useState } from "react";
import { formatCount } from "@/lib/format";

type Video = {
  id: string;
  title?: string;
  video_description?: string;
  cover_image_url?: string;
  share_url?: string;
  create_time?: number;
  duration?: number;
  like_count?: number;
  comment_count?: number;
  view_count?: number;
};

const PROVIDER_META: Record<string, { label: string; icon: string }> = {
  tiktok:    { label: "TikTok", icon: "♪" },
  facebook:  { label: "Facebook", icon: "f" },
  instagram: { label: "Instagram", icon: "📷" },
  google:    { label: "YouTube", icon: "▶" },
};

export default function ManageButton({ provider }: { provider: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[] | null>(null);

  const meta = PROVIDER_META[provider];
  const supported = Boolean(meta);
  const label = meta?.label ?? provider;
  const icon = meta?.icon ?? "•";

  async function loadVideos() {
    setOpen(true);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/connect/${provider}/videos`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load posts");
      setVideos(data.videos ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <span className="text-xs text-[#C2C2C2] opacity-0 transition-opacity group-hover:opacity-100">
        Manage &rarr;
      </span>
    );
  }

  return (
    <>
      <button
        onClick={loadVideos}
        className="text-[13px] text-[#0A0A0A] font-[450] opacity-0 transition-opacity hover:opacity-55 group-hover:opacity-100"
      >
        Manage &rarr;
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded border border-[#E8E8E8] bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E8E8E8] px-6 py-4">
              <div>
                <h2 className="text-lg font-medium text-[#0A0A0A]">{label} posts</h2>
                <p className="mt-0.5 text-xs text-[#969696]">
                  Pulled from your connected {label} account
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1.5 text-[#969696] transition-colors hover:bg-[#F6F6F6] hover:text-[#0A0A0A]"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              {loading && (
                <div className="py-16 text-center text-sm text-[#969696]">
                  Loading posts&hellip;
                </div>
              )}

              {error && !loading && (
                <div className="rounded border border-[#CC2A1E]/20 bg-red-50 px-4 py-3 text-sm text-[#CC2A1E]">
                  {error}
                </div>
              )}

              {!loading && !error && videos?.length === 0 && (
                <div className="py-16 text-center text-sm text-[#969696]">
                  No posts found on this {label} account.
                </div>
              )}

              {!loading && !error && videos && videos.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {videos.map((v) => (
                    <a
                      key={v.id}
                      href={v.share_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/post overflow-hidden rounded border border-[#E8E8E8] bg-white transition-colors hover:border-[#DEDEDE]"
                    >
                      <div className={`w-full overflow-hidden bg-[#F4F4F4] ${provider === "google" ? "aspect-video" : "aspect-[9/16]"}`}>
                        {v.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={v.cover_image_url}
                            alt={v.title || `${label} post`}
                            className="h-full w-full object-cover transition-transform group-hover/post:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl text-[#969696]">
                            {icon}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-2 text-xs font-medium text-[#0A0A0A]">
                          {v.title || v.video_description || "Untitled"}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-[#969696]">
                          <span title="Views">&#9654; {formatCount(v.view_count)}</span>
                          <span title="Likes">&#9829; {formatCount(v.like_count)}</span>
                          <span title="Comments">&#128172; {formatCount(v.comment_count)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
