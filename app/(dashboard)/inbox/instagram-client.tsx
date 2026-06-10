"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  author: string;
  title?: string;
  snippet: string;
  timestamp: number;
  url?: string;
  recipientId?: string;
  imageUrl?: string;
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

  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [repliedIds, setRepliedIds] = useState<Set<string>>(new Set());

  async function sendReply(item: Item) {
    if (!replyText.trim()) return;
    setReplySending(true);
    setReplyError(null);
    try {
      const endpoint =
        view === "comments"
          ? "/api/inbox/instagram/comment-reply"
          : "/api/inbox/instagram/dm-send";
      const body =
        view === "comments"
          ? { comment_id: item.id, message: replyText.trim() }
          : { recipient_id: item.recipientId, message: replyText.trim() };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.needsReconnect) {
        setNeedsReconnect(true);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to send reply");
      setRepliedIds((prev) => new Set(prev).add(item.id));
      setReplyingId(null);
      setReplyText("");
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : "Failed to send reply");
    } finally {
      setReplySending(false);
    }
  }

  function toggleReply(id: string) {
    setReplyingId((cur) => (cur === id ? null : id));
    setReplyText("");
    setReplyError(null);
  }

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
              <div className="flex gap-3">
                {view === "comments" && item.imageUrl && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                    title="View post on Instagram"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  </a>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-200">
                      {item.author}
                    </span>
                    <span className="flex-shrink-0 text-[11px] text-zinc-600">
                      {timeAgo(item.timestamp)}
                    </span>
                  </div>
                  {view === "comments" && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      on “{item.title}”
                    </p>
                  )}
                  <p className="mt-1.5 text-sm text-zinc-300">{item.snippet}</p>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs">
                {view === "dms" && !item.recipientId ? null : repliedIds.has(
                    item.id
                  ) ? (
                  <span className="text-emerald-400">Replied ✓</span>
                ) : (
                  <button
                    onClick={() => toggleReply(item.id)}
                    className="text-pink-400 hover:text-pink-300"
                  >
                    Reply
                  </button>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    View on Instagram &rarr;
                  </a>
                )}
              </div>

              {replyingId === item.id && (
                <div className="mt-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendReply(item);
                        }
                      }}
                      placeholder={
                        view === "comments"
                          ? "Write a reply…"
                          : `Message ${item.author}…`
                      }
                      disabled={replySending}
                      className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-pink-500 focus:outline-none"
                    />
                    <button
                      onClick={() => sendReply(item)}
                      disabled={replySending || !replyText.trim()}
                      className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-500 disabled:opacity-50"
                    >
                      {replySending ? "Sending…" : "Send"}
                    </button>
                  </div>
                  {replyError && (
                    <p className="mt-1 text-[11px] text-red-400">{replyError}</p>
                  )}
                  {view === "dms" && (
                    <p className="mt-1 text-[11px] text-zinc-600">
                      Instagram only delivers replies within 24h of the user’s
                      last message.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
