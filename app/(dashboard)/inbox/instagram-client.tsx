"use client";

import { useEffect, useState } from "react";
import { useCachedFetch } from "./use-cached-fetch";

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
  const {
    data: igData,
    loading,
    error,
    refreshing,
    refresh,
  } = useCachedFetch<{
    comments: Item[];
    dms: Item[];
    errors: { kind: string; error: string }[];
    canComments: boolean;
    canMessages: boolean;
  }>("/api/inbox/instagram");
  const comments = igData?.comments ?? [];
  const dms = igData?.dms ?? [];
  const sectionErrors = igData?.errors ?? [];
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
    if (
      igData &&
      (igData.canComments === false || igData.canMessages === false)
    )
      setNeedsReconnect(true);
  }, [igData]);

  const items = view === "comments" ? comments : dms;
  const sectionError = sectionErrors.find((e) =>
    view === "comments" ? e.kind === "comments" : e.kind === "dms"
  );

  return (
    <div className="mt-6 flex flex-1 flex-col overflow-hidden">
      {needsReconnect && (
        <div className="mb-4 rounded border border-[#9A6B00]/20 bg-amber-50 px-4 py-3 text-sm text-[#9A6B00]">
          {!canComments && !canMessages
            ? "Reconnect Instagram to grant comment and message access."
            : !canComments
              ? "Reconnect Instagram to grant comment access."
              : "Reconnect Instagram to grant message access."}{" "}
          <a
            href="/api/connect/instagram"
            className="font-medium underline hover:opacity-70"
          >
            Reconnect Instagram
          </a>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-[#E8E8E8]">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setView("comments")}
            className={`-mb-px border-b px-0 pb-3 text-[13.5px] transition-colors ${
              view === "comments"
                ? "border-[#0A0A0A] text-[#0A0A0A] font-medium"
                : "border-transparent text-[#969696] font-[450] hover:text-[#0A0A0A]"
            }`}
          >
            Comments{" "}
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] text-[#969696]">{comments.length}</span>
          </button>
          <button
            onClick={() => setView("dms")}
            className={`-mb-px border-b px-0 pb-3 text-[13.5px] transition-colors ${
              view === "dms"
                ? "border-[#0A0A0A] text-[#0A0A0A] font-medium"
                : "border-transparent text-[#969696] font-[450] hover:text-[#0A0A0A]"
            }`}
          >
            DMs <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] text-[#969696]">{dms.length}</span>
          </button>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing || loading}
          title="Refresh"
          className="mr-1 rounded border border-[#DEDEDE] px-3 py-1.5 text-xs text-[#5A5A5A] transition-colors hover:bg-[#F6F6F6] hover:text-[#0A0A0A] disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-4">
        {loading && (
          <div className="py-16 text-center text-sm text-[#969696]">
            Loading Instagram&hellip;
          </div>
        )}

        {error && !loading && (
          <div className="rounded border border-[#CC2A1E]/20 bg-red-50 px-4 py-3 text-sm text-[#CC2A1E]">
            {error}
          </div>
        )}

        {!loading && !error && sectionError && (
          <div className="mb-3 rounded border border-[#CC2A1E]/20 bg-red-50 px-4 py-3 text-sm text-[#CC2A1E]">
            {sectionError.error}
          </div>
        )}

        {!loading && !error && items.length === 0 && !sectionError && (
          <div className="py-16 text-center text-sm text-[#969696]">
            {view === "comments"
              ? "No comments on your recent posts."
              : "No direct messages."}
          </div>
        )}

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded border border-[#E8E8E8] bg-white p-4"
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
                      className="h-12 w-12 rounded object-cover"
                    />
                  </a>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#0A0A0A]">
                      {item.author}
                    </span>
                    <span className="flex-shrink-0 text-[11px] text-[#C2C2C2]">
                      {timeAgo(item.timestamp)}
                    </span>
                  </div>
                  {view === "comments" && (
                    <p className="mt-0.5 truncate text-xs text-[#969696]">
                      on &ldquo;{item.title}&rdquo;
                    </p>
                  )}
                  <p className="mt-1.5 text-sm text-[#5A5A5A]">{item.snippet}</p>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs">
                {view === "dms" && !item.recipientId ? null : repliedIds.has(
                    item.id
                  ) ? (
                  <span className="text-[#1F7A4D]">Replied &#10003;</span>
                ) : (
                  <button
                    onClick={() => toggleReply(item.id)}
                    className="text-[#0A0A0A] hover:opacity-55"
                  >
                    Reply
                  </button>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#969696] hover:text-[#0A0A0A]"
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
                      className="flex-1 rounded border border-[#DEDEDE] bg-white px-3 py-2 text-sm text-[#0A0A0A] placeholder-[#969696] focus:border-[#0A0A0A] focus:outline-none"
                    />
                    <button
                      onClick={() => sendReply(item)}
                      disabled={replySending || !replyText.trim()}
                      className="rounded bg-[#0A0A0A] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
                    >
                      {replySending ? "Sending…" : "Send"}
                    </button>
                  </div>
                  {replyError && (
                    <p className="mt-1 text-[11px] text-[#CC2A1E]">{replyError}</p>
                  )}
                  {view === "dms" && (
                    <p className="mt-1 text-[11px] text-[#C2C2C2]">
                      Instagram only delivers replies within 24h of the user&apos;s
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
