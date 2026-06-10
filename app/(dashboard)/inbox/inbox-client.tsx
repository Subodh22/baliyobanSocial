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
  like_count?: number;
  comment_count?: number;
  view_count?: number;
};

type Comment = {
  id: string;
  video_id: string;
  text: string;
  likes: number;
  reply_count: number;
  parent_comment_id: string;
  create_time: number;
};

function timeAgo(unix: number): string {
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function InboxClient({
  hasCommentScope,
}: {
  hasCommentScope: boolean;
}) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [videosLoaded, setVideosLoaded] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentsCursor, setCommentsCursor] = useState<number | null>(null);
  const [commentsHasMore, setCommentsHasMore] = useState(false);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const [needsReconnect, setNeedsReconnect] = useState(!hasCommentScope);

  async function loadVideos() {
    if (videosLoaded) return;
    setVideosLoading(true);
    setVideosError(null);
    try {
      const res = await fetch("/api/connect/tiktok/videos");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load videos");
      setVideos(data.videos ?? []);
      setVideosLoaded(true);
    } catch (e) {
      setVideosError(e instanceof Error ? e.message : "Failed to load videos");
    } finally {
      setVideosLoading(false);
    }
  }

  async function loadComments(videoId: string, cursor?: number | null) {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const params = new URLSearchParams({ video_id: videoId });
      if (cursor) params.set("cursor", String(cursor));
      const res = await fetch(`/api/connect/tiktok/comments?${params}`);
      const data = await res.json();
      if (data.needsReconnect) {
        setNeedsReconnect(true);
        setCommentsLoading(false);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to load comments");
      setComments((prev) =>
        cursor ? [...prev, ...(data.comments ?? [])] : data.comments ?? []
      );
      setCommentsCursor(data.cursor);
      setCommentsHasMore(data.hasMore);
    } catch (e) {
      setCommentsError(
        e instanceof Error ? e.message : "Failed to load comments"
      );
    } finally {
      setCommentsLoading(false);
    }
  }

  function selectVideo(video: Video) {
    setSelectedVideo(video);
    setComments([]);
    setCommentsCursor(null);
    setCommentsHasMore(false);
    setReplyingTo(null);
    setReplyText("");
    loadComments(video.id);
  }

  async function sendReply(commentId: string) {
    if (!selectedVideo || !replyText.trim()) return;
    setReplySending(true);
    setReplyError(null);
    try {
      const res = await fetch("/api/connect/tiktok/comments/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: selectedVideo.id,
          comment_id: commentId,
          text: replyText.trim(),
        }),
      });
      const data = await res.json();
      if (data.needsReconnect) {
        setNeedsReconnect(true);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to send reply");
      setReplyText("");
      setReplyingTo(null);
      // Refresh comments to show the new reply.
      loadComments(selectedVideo.id);
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : "Failed to send reply");
    } finally {
      setReplySending(false);
    }
  }

  // Load videos on first render.
  if (!videosLoaded && !videosLoading && !videosError) {
    loadVideos();
  }

  return (
    <div className="mt-8 flex flex-1 overflow-hidden">
      {/* Video list (left panel) */}
      <div className="flex w-full max-w-sm flex-col border-r border-white/[0.06]">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-300">TikTok</span>
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] text-indigo-400">
              {videos.length} videos
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {videosLoading && (
            <div className="py-16 text-center text-sm text-zinc-500">
              Loading videos&hellip;
            </div>
          )}

          {videosError && !videosLoading && (
            <div className="m-4 rounded-lg border border-red-500/20 bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {videosError}
            </div>
          )}

          {!videosLoading && !videosError && videos.length === 0 && videosLoaded && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
                <span className="text-lg text-indigo-400">&#9834;</span>
              </div>
              <p className="mt-3 text-sm font-medium text-zinc-300">
                No TikTok videos found
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Post a video on TikTok to see engagement here.
              </p>
            </div>
          )}

          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => selectVideo(v)}
              className={`flex w-full items-start gap-3 border-b border-white/[0.04] px-4 py-3 text-left transition-colors hover:bg-white/[0.03] ${
                selectedVideo?.id === v.id ? "bg-white/[0.05]" : ""
              }`}
            >
              <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded-md bg-black/40">
                {v.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.cover_image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-700">
                    &#9834;
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-200">
                  {v.title || v.video_description || "Untitled"}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-500">
                  <span>&#9654; {formatCount(v.view_count)}</span>
                  <span>&#9829; {formatCount(v.like_count)}</span>
                  <span>&#128172; {formatCount(v.comment_count)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Comments panel (right) */}
      <div className="flex flex-1 flex-col">
        {needsReconnect && (
          <div className="mx-6 mt-4 rounded-lg border border-amber-500/20 bg-amber-950/40 px-4 py-3 text-sm text-amber-400">
            To view and reply to comments, reconnect your TikTok account with
            updated permissions.{" "}
            <a
              href="/api/connect/tiktok"
              className="font-medium underline hover:text-amber-300"
            >
              Reconnect TikTok
            </a>
          </div>
        )}

        {!selectedVideo && (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <div>
              <p className="text-sm text-zinc-500">
                Select a video to view its comments
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Replies are sent via TikTok&apos;s API
              </p>
            </div>
          </div>
        )}

        {selectedVideo && (
          <>
            {/* Video header */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-4">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold text-zinc-100">
                  {selectedVideo.title ||
                    selectedVideo.video_description ||
                    "Untitled"}
                </h2>
                <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                  <span>&#9654; {formatCount(selectedVideo.view_count)}</span>
                  <span>&#9829; {formatCount(selectedVideo.like_count)}</span>
                  <span>
                    &#128172; {formatCount(selectedVideo.comment_count)}
                  </span>
                </div>
              </div>
              {selectedVideo.share_url && (
                <a
                  href={selectedVideo.share_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-300"
                >
                  View on TikTok &rarr;
                </a>
              )}
            </div>

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {commentsLoading && comments.length === 0 && (
                <div className="py-16 text-center text-sm text-zinc-500">
                  Loading comments&hellip;
                </div>
              )}

              {commentsError && (
                <div className="rounded-lg border border-red-500/20 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                  {commentsError}
                </div>
              )}

              {!commentsLoading &&
                !commentsError &&
                comments.length === 0 && (
                  <div className="py-16 text-center text-sm text-zinc-500">
                    No comments on this video yet.
                  </div>
                )}

              <div className="space-y-1">
                {comments
                  .filter((c) => c.parent_comment_id === "0")
                  .map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4"
                    >
                      <p className="text-sm text-zinc-200">{comment.text}</p>
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-zinc-500">
                        <span>&#9829; {comment.likes}</span>
                        {comment.reply_count > 0 && (
                          <span>
                            {comment.reply_count}{" "}
                            {comment.reply_count === 1 ? "reply" : "replies"}
                          </span>
                        )}
                        <span>{timeAgo(comment.create_time)}</span>
                        <button
                          onClick={() => {
                            setReplyingTo(
                              replyingTo === comment.id ? null : comment.id
                            );
                            setReplyText("");
                            setReplyError(null);
                          }}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          Reply
                        </button>
                      </div>

                      {replyingTo === comment.id && (
                        <div className="mt-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  sendReply(comment.id);
                                }
                              }}
                              placeholder="Write a reply..."
                              maxLength={150}
                              className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                              disabled={replySending}
                            />
                            <button
                              onClick={() => sendReply(comment.id)}
                              disabled={replySending || !replyText.trim()}
                              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                            >
                              {replySending ? "Sending..." : "Send"}
                            </button>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-600">
                            <span>{replyText.length}/150</span>
                            {replyError && (
                              <span className="text-red-400">{replyError}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {commentsHasMore && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() =>
                      loadComments(selectedVideo.id, commentsCursor)
                    }
                    disabled={commentsLoading}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-300 disabled:opacity-50"
                  >
                    {commentsLoading ? "Loading..." : "Load more comments"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
