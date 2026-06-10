"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  author: string;
  title?: string;
  snippet: string;
  timestamp: number;
  url?: string;
};

function timeAgo(unix: number): string {
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function InstagramClient({
  canComments,
  canMessages,
}: {
  canComments: boolean;
  canMessages: boolean;
}) {
  const [view, setView] = useState<"comments" | "dms">("comments");
  const [comments, setComments] = useState<Item[]>([]);
  const [dms, setDms] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionErrors, setSectionErrors] = useState<
    { kind: string; error: string }[]
  >([]);
  const [needsReconnect, setNeedsReconnect] = useState(
    !canComments || !canMessages
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/inbox/instagram");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load Instagram");
        setComments(data.comments ?? []);
        setDms(data.dms ?? []);
        setSectionErrors(data.errors ?? []);
        if (data.canComments === false || data.canMessages === false)
          setNeedsReconnect(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load Instagram");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const items = view === "comments" ? comments : dms;
  const sectionError = sectionErrors.find((e) =>
    view === "comments" ? e.kind === "comments" : e.kind === "dms"
  );

  return (
    <div className="mt-6 flex flex-1 flex-col overflow-hidden">
      {needsReconnect && (
        <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-950/40 px-4 py-3 text-sm text-amber-400">
          {!canComments && !canMessages
            ? "Reconnect Instagram to grant comment and message access."
            : !canComments
              ? "Reconnect Instagram to grant comment access."
              : "Reconnect Instagram to grant message access."}{" "}
          <a
            href="/api/connect/instagram"
            className="font-medium underline hover:text-amber-300"
          >
            Reconnect Instagram
          </a>
        </div>
      )}

      <div className="flex items-center gap-1 border-b border-white/[0.06]">
        <button
          onClick={() => setView("comments")}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            view === "comments"
              ? "border-pink-500 text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Comments{" "}
          <span className="text-xs text-zinc-600">{comments.length}</span>
        </button>
        <button
          onClick={() => setView("dms")}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            view === "dms"
              ? "border-pink-500 text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          DMs <span className="text-xs text-zinc-600">{dms.length}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-4">
        {loading && (
          <div className="py-16 text-center text-sm text-zinc-500">
            Loading Instagram&hellip;
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-red-500/20 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && sectionError && (
          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {sectionError.error}
          </div>
        )}

        {!loading && !error && items.length === 0 && !sectionError && (
          <div className="py-16 text-center text-sm text-zinc-500">
            {view === "comments"
              ? "No comments on your recent posts."
              : "No direct messages."}
          </div>
        )}

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-200">
                  {item.author}
                </span>
                <span className="flex-shrink-0 text-[11px] text-zinc-600">
                  {timeAgo(item.timestamp)}
                </span>
              </div>
              {view === "comments" && item.title && (
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  on “{item.title}”
                </p>
              )}
              <p className="mt-1.5 text-sm text-zinc-300">{item.snippet}</p>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-pink-400 hover:text-pink-300"
                >
                  View on Instagram &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
