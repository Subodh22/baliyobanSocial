"use client";

import { useState } from "react";
import { formatCount } from "@/lib/format";
import { useCachedFetch } from "./use-cached-fetch";

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
  const {
    data: videosData,
    loading: videosLoading,
    error: videosError,
    refreshing,
    refresh,
  } = useCachedFetch<{ videos: Video[] }>("/api/connect/tiktok/videos");
  const videos = videosData?.videos ?? [];

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
      loadComments(selectedVideo.id);
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : "Failed to send reply");
    } finally {
      setReplySending(false);
    }
  }

  return (
    <div className="mt-6 flex flex-1 overflow-hidden">
      {/* Video list (left panel) */}
      <div className="flex w-full max-w-sm flex-col border-r border-[#E8E8E8]">
        <div className="flex items-center justify-between border-b border-[#E8E8E8] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#0A0A0A]">TikTok</span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10.5px] font-medium text-[#5A5A5A] bg-[#F4F4F4] border border-[#DEDEDE] px-[7px] py-[2px] rounded-[3px]">
              {videos.length} videos
            </span>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing || videosLoading}
            title="Refresh"
            className="rounded border border-[#DEDEDE] px-3 py-1.5 text-xs text-[#5A5A5A] transition-colors hover:bg-[#F6F6F6] hover:text-[#0A0A0A] disabled:opacity-50"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {videosLoading && (
            <div className="py-16 text-center text-sm text-[#969696]">
              Loading videos&hellip;
            </div>
          )}

          {videosError && !videosLoading && (
            <div className="m-4 rounded border border-[#CC2A1E]/20 bg-red-50 px-4 py-3 text-sm text-[#CC2A1E]">
              {videosError}
            </div>
          )}

          {!videosLoading && !videosError && videos.length === 0 && videosData && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-sm font-medium text-[#0A0A0A]">
                No TikTok videos found
              </p>
              <p className="mt-1 text-xs text-[#969696]">
                Post a video on TikTok to see engagement here.
              </p>
            </div>
          )}

          {videos.map((v, i) => (
            <button
              key={v.id}
              onClick={() => selectVideo(v)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F6F6F6] ${
                i < videos.length - 1 ? "border-b border-[#E8E8E8]" : ""
              } ${selectedVideo?.id === v.id ? "bg-[#F6F6F6]" : ""}`}
            >
              <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-[#F4F4F4]">
                {v.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.cover_image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[#969696]">
                    &#9834;
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#0A0A0A]">
                  {v.title || v.video_description || "Untitled"}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-[#969696]">
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
          <div className="mx-6 mt-4 rounded border border-[#9A6B00]/20 bg-amber-50 px-4 py-3 text-sm text-[#9A6B00]">
            To view and reply to comments, reconnect your TikTok account with
            updated permissions.{" "}
            <a
              href="/api/connect/tiktok"
              className="font-medium underline hover:opacity-70"
            >
              Reconnect TikTok
            </a>
          </div>
        )}

        {!selectedVideo && (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <div>
              <p className="text-sm text-[#969696]">
                Select a video to view its comments
              </p>
              <p className="mt-1 text-xs text-[#C2C2C2]">
                Replies are sent via TikTok&apos;s API
              </p>
            </div>
          </div>
        )}

        {selectedVideo && (
          <>
            {/* Video header */}
            <div className="flex items-center gap-3 border-b border-[#E8E8E8] px-6 py-4">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-medium text-[#0A0A0A]">
                  {selectedVideo.title ||
                    selectedVideo.video_description ||
                    "Untitled"}
                </h2>
                <div className="mt-1 flex items-center gap-3 text-xs text-[#969696]">
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
                  className="flex-shrink-0 rounded border border-[#DEDEDE] px-3 py-1.5 text-xs text-[#5A5A5A] transition-colors hover:bg-[#F6F6F6] hover:text-[#0A0A0A]"
                >
                  View on TikTok &rarr;
                </a>
              )}
            </div>

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {commentsLoading && comments.length === 0 && (
                <div className="py-16 text-center text-sm text-[#969696]">
                  Loading comments&hellip;
                </div>
              )}

              {commentsError && (
                <div className="rounded border border-[#CC2A1E]/20 bg-red-50 px-4 py-3 text-sm text-[#CC2A1E]">
                  {commentsError}
                </div>
              )}

              {!commentsLoading &&
                !commentsError &&
                comments.length === 0 && (
                  <div className="py-16 text-center text-sm text-[#969696]">
                    No comments on this video yet.
                  </div>
                )}

              <div className="space-y-1">
                {comments
                  .filter((c) => c.parent_comment_id === "0")
                  .map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded border border-[#E8E8E8] bg-white p-4"
                    >
                      <p className="text-sm text-[#0A0A0A]">{comment.text}</p>
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-[#969696]">
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
                          className="text-[#0A0A0A] hover:opacity-55"
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
                              className="flex-1 rounded border border-[#DEDEDE] bg-white px-3 py-2 text-sm text-[#0A0A0A] placeholder-[#969696] focus:border-[#0A0A0A] focus:outline-none"
                              disabled={replySending}
                            />
                            <button
                              onClick={() => sendReply(comment.id)}
                              disabled={replySending || !replyText.trim()}
                              className="rounded bg-[#0A0A0A] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
                            >
                              {replySending ? "Sending..." : "Send"}
                            </button>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-[#C2C2C2]">
                            <span>{replyText.length}/150</span>
                            {replyError && (
                              <span className="text-[#CC2A1E]">{replyError}</span>
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
                    className="rounded border border-[#DEDEDE] px-4 py-2 text-sm text-[#5A5A5A] transition-colors hover:bg-[#F6F6F6] hover:text-[#0A0A0A] disabled:opacity-50"
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
