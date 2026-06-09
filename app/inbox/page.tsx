"use client";

import { useState } from "react";
import Link from "next/link";

type Comment = {
  id: string;
  text: string;
  create_time: number;
  likes: number;
  replies: number;
  user: { display_name: string; avatar_url: string };
};

export default function Inbox() {
  const [videoId, setVideoId] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Track which comment is being replied to
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  async function fetchComments(nextCursor?: string) {
    if (!videoId.trim()) return setError("Enter a TikTok video ID");
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams({
        platform: "tiktok",
        videoId: videoId.trim(),
      });
      if (nextCursor) params.set("cursor", nextCursor);
      const res = await fetch(`/api/comments?${params}`);
      const data = await res.json();
      if (!data.ok) return setError(data.error ?? "Failed to load comments");
      if (nextCursor) {
        setComments((prev) => [...prev, ...(data.comments ?? [])]);
      } else {
        setComments(data.comments ?? []);
      }
      setCursor(data.cursor);
      setHasMore(data.hasMore ?? false);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function sendReply(commentId: string) {
    if (!replyText.trim()) return;
    setReplySending(true);
    setReplySuccess(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "tiktok",
          videoId: videoId.trim(),
          commentId,
          text: replyText.trim(),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Failed to send reply");
      } else {
        setReplySuccess(commentId);
        setReplyText("");
        setReplyingTo(null);
      }
    } catch {
      setError("Network error");
    } finally {
      setReplySending(false);
    }
  }

  return (
    <div className="flex flex-1 min-h-[calc(100vh-1px)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#111]">
        <div className="p-4 pb-2">
          <p className="px-2 py-2 text-sm font-semibold text-zinc-100">
            baliyoban
          </p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 pt-2">
          {[
            { label: "Connections", href: "/dashboard" },
            { label: "Posts", href: "/compose" },
            { label: "Inbox", href: "/inbox", active: true },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                item.active
                  ? "bg-white/[0.08] font-semibold text-zinc-100"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  item.active ? "bg-indigo-400" : "bg-zinc-700"
                }`}
              />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] p-4">
          <p className="text-[11px] text-zinc-600">baliyoban v0.1</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Inbox
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              View and reply to comments on your TikTok videos
            </p>
          </div>
        </div>

        {/* Video ID input */}
        <div className="mt-8 flex items-end gap-3">
          <div className="flex-1">
            <label
              htmlFor="videoId"
              className="block text-sm font-medium text-zinc-400 mb-1.5"
            >
              TikTok Video ID
            </label>
            <input
              id="videoId"
              type="text"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="e.g. 7234567890123456789"
              onKeyDown={(e) => e.key === "Enter" && fetchComments()}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => fetchComments()}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Comments"}
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-800 bg-red-950 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Comments list */}
        {comments.length > 0 && (
          <div className="mt-6 space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/10"
              >
                <div className="flex items-start gap-3">
                  {c.user.avatar_url ? (
                    <img
                      src={c.user.avatar_url}
                      alt=""
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white">
                      {c.user.display_name?.[0] ?? "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-200">
                        {c.user.display_name}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {new Date(c.create_time * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-300">{c.text}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-xs text-zinc-500">
                        {c.likes} likes
                      </span>
                      <span className="text-xs text-zinc-500">
                        {c.replies} replies
                      </span>
                      <button
                        onClick={() => {
                          setReplyingTo(
                            replyingTo === c.id ? null : c.id
                          );
                          setReplyText("");
                          setReplySuccess(null);
                        }}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Reply
                      </button>
                      {replySuccess === c.id && (
                        <span className="text-xs text-emerald-400">
                          Reply sent!
                        </span>
                      )}
                    </div>

                    {/* Reply input */}
                    {replyingTo === c.id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && sendReply(c.id)
                          }
                          placeholder="Write a reply..."
                          maxLength={150}
                          className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                        />
                        <button
                          onClick={() => sendReply(c.id)}
                          disabled={replySending || !replyText.trim()}
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                        >
                          {replySending ? "..." : "Send"}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={() => fetchComments(cursor)}
                disabled={loading}
                className="w-full rounded-lg border border-white/10 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        )}

        {comments.length === 0 && !loading && !error && videoId && (
          <p className="mt-8 text-center text-sm text-zinc-500">
            No comments found. Try a different video ID.
          </p>
        )}
      </main>
    </div>
  );
}
