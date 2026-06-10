"use client";

import { useCallback, useEffect, useState } from "react";

type Post = {
  id: string;
  title?: string;
  cover_image_url?: string;
  share_url?: string;
  create_time?: number;
  like_count?: number;
  comment_count?: number;
};

type Comment = {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  like_count?: number;
  replies?: { data: Comment[] };
};

export default function Inbox() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // commentId or null for top-level
  const [sending, setSending] = useState(false);

  // Fetch Instagram posts on mount.
  useEffect(() => {
    fetch("/api/connect/instagram/videos")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setPostsError(data.error);
        } else {
          setPosts(data.videos ?? []);
        }
      })
      .catch(() => setPostsError("Failed to load posts"))
      .finally(() => setLoadingPosts(false));
  }, []);

  // Fetch comments for a post.
  const loadComments = useCallback((post: Post) => {
    setSelectedPost(post);
    setComments([]);
    setLoadingComments(true);
    setReplyText("");
    setReplyingTo(null);

    fetch(`/api/connect/instagram/comments?mediaId=${post.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setComments(data.comments ?? []);
      })
      .finally(() => setLoadingComments(false));
  }, []);

  // Send a comment or reply.
  const sendReply = async () => {
    if (!replyText.trim() || !selectedPost) return;
    setSending(true);

    const body: Record<string, string> = { text: replyText.trim() };
    if (replyingTo) {
      body.commentId = replyingTo;
    } else {
      body.mediaId = selectedPost.id;
    }

    try {
      const res = await fetch("/api/connect/instagram/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.id) {
        setReplyText("");
        setReplyingTo(null);
        // Refresh comments to show the new one.
        loadComments(selectedPost);
      }
    } finally {
      setSending(false);
    }
  };

  const formatDate = (ts?: number | string) => {
    if (!ts) return "";
    const d = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Inbox
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Comments and likes on your Instagram posts
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden min-h-[500px]">
        {/* Post list */}
        <div className="w-full max-w-sm border-r border-white/[0.06] overflow-y-auto">
          {loadingPosts && (
            <div className="flex items-center justify-center py-16 text-sm text-zinc-500">
              Loading posts...
            </div>
          )}

          {postsError && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
                <svg
                  className="h-5 w-5 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-zinc-300">
                {postsError}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Connect your Instagram account in Settings to see engagement
                here.
              </p>
            </div>
          )}

          {!loadingPosts &&
            !postsError &&
            posts.map((post) => (
              <button
                key={post.id}
                onClick={() => loadComments(post)}
                className={`flex w-full items-start gap-3 border-b border-white/[0.06] px-4 py-3 text-left transition-colors hover:bg-white/[0.04] ${
                  selectedPost?.id === post.id ? "bg-white/[0.06]" : ""
                }`}
              >
                {post.cover_image_url && (
                  <img
                    src={post.cover_image_url}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {post.title || "Untitled post"}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {formatDate(post.create_time)}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                      {post.like_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                        />
                      </svg>
                      {post.comment_count ?? 0}
                    </span>
                  </div>
                </div>
              </button>
            ))}

          {!loadingPosts && !postsError && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p className="text-sm font-medium text-zinc-300">No posts yet</p>
              <p className="mt-1 text-xs text-zinc-500">
                Your Instagram posts will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Comment detail */}
        <div className="flex flex-1 flex-col">
          {!selectedPost && (
            <div className="flex flex-1 items-center justify-center text-center px-6">
              <div>
                <p className="text-sm text-zinc-500">
                  Select a post to view comments
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  You can reply to comments directly from here
                </p>
              </div>
            </div>
          )}

          {selectedPost && (
            <>
              {/* Post header */}
              <div className="border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center gap-3">
                  {selectedPost.cover_image_url && (
                    <img
                      src={selectedPost.cover_image_url}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-100">
                      {selectedPost.title || "Untitled post"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{selectedPost.like_count ?? 0} likes</span>
                      <span>{selectedPost.comment_count ?? 0} comments</span>
                    </div>
                  </div>
                  {selectedPost.share_url && (
                    <a
                      href={selectedPost.share_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
                    >
                      View on Instagram
                    </a>
                  )}
                </div>
              </div>

              {/* Comments list */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {loadingComments && (
                  <p className="text-sm text-zinc-500">Loading comments...</p>
                )}

                {!loadingComments && comments.length === 0 && (
                  <p className="text-sm text-zinc-500">
                    No comments on this post yet.
                  </p>
                )}

                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-3">
                    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-indigo-400">
                          @{comment.username}
                        </span>
                        <span className="text-xs text-zinc-600">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-300">
                        {comment.text}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        {(comment.like_count ?? 0) > 0 && (
                          <span className="text-xs text-zinc-500">
                            {comment.like_count} likes
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setReplyingTo(comment.id);
                            setReplyText(`@${comment.username} `);
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          Reply
                        </button>
                      </div>
                    </div>

                    {/* Nested replies */}
                    {comment.replies?.data?.map((reply) => (
                      <div
                        key={reply.id}
                        className="ml-6 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-indigo-400">
                            @{reply.username}
                          </span>
                          <span className="text-xs text-zinc-600">
                            {formatDate(reply.timestamp)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-300">
                          {reply.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Reply box */}
              <div className="border-t border-white/[0.06] px-5 py-4">
                {replyingTo && (
                  <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                    <span>
                      Replying to comment
                    </span>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      className="text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                    placeholder={
                      replyingTo
                        ? "Write a reply..."
                        : "Write a comment..."
                    }
                    className="flex-1 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                    disabled={sending}
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !replyText.trim()}
                    className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
