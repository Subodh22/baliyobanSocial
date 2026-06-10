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

  // Providers with a posts endpoint wired up.
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
      <span className="text-xs text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
        Manage &rarr;
      </span>
    );
  }

  return (
    <>
      <button
        onClick={loadVideos}
        className="text-xs text-indigo-400 opacity-0 transition-opacity hover:text-indigo-300 group-hover:opacity-100"
      >
        Manage &rarr;
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-white/10 bg-[#181818] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">{label} posts</h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Pulled from your connected {label} account
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              {loading && (
                <div className="py-16 text-center text-sm text-zinc-500">
                  Loading posts&hellip;
                </div>
              )}

              {error && !loading && (
                <div className="rounded-lg border border-red-500/20 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {!loading && !error && videos?.length === 0 && (
                <div className="py-16 text-center text-sm text-zinc-500">
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
                      className="group/post overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors hover:border-white/15"
                    >
                      <div className={`w-full overflow-hidden bg-black/40 ${provider === "google" ? "aspect-video" : "aspect-[9/16]"}`}>
                        {v.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={v.cover_image_url}
                            alt={v.title || `${label} post`}
                            className="h-full w-full object-cover transition-transform group-hover/post:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl text-zinc-700">
                            {icon}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-2 text-xs font-medium text-zinc-200">
                          {v.title || v.video_description || "Untitled"}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
                          <span title="Views">▶ {formatCount(v.view_count)}</span>
                          <span title="Likes">♥ {formatCount(v.like_count)}</span>
                          <span title="Comments">💬 {formatCount(v.comment_count)}</span>
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
