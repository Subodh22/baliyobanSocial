"use client";

import { useState } from "react";
import Link from "next/link";

const PLATFORMS = [
  // provider = the connected Account provider each platform posts through
  // (must match the mapping in /api/post).
  { id: "twitter",   label: "Twitter / X",     icon: "𝕏",  provider: "twitter" },
  { id: "facebook",  label: "Facebook",        icon: "f",   provider: "facebook" },
  { id: "instagram", label: "Instagram",       icon: "📷",  provider: "facebook", requiresMedia: true },
  { id: "linkedin",  label: "LinkedIn",        icon: "in",  provider: "linkedin" },
  { id: "tiktok",    label: "TikTok",          icon: "♪",   provider: "tiktok", requiresMedia: true },
  { id: "youtube",   label: "YouTube",         icon: "▶",   provider: "google", requiresMedia: true },
];

const VIDEO_RE = /\.(mp4|mov|webm|avi|mkv)(\?|$)/i;

type Result = { ok: boolean; url?: string; error?: string };

export default function ComposeClient({
  connectedProviders,
}: {
  connectedProviders: string[];
}) {
  const connected = new Set(connectedProviders);

  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  // Pre-select every platform the user can actually post to.
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(PLATFORMS.filter((p) => connected.has(p.provider)).map((p) => p.id))
  );
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, Result> | null>(null);
  const [error, setError] = useState("");
  const [scheduleOn, setScheduleOn] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduledConfirmation, setScheduledConfirmation] = useState<string | null>(null);

  function togglePlatform(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleMediaUrl(url: string) {
    setMediaUrl(url);
    setMediaType(VIDEO_RE.test(url) ? "video" : "image");
  }

  async function handlePost() {
    if (!content.trim()) return setError("Write something first!");
    if (selected.size === 0) return setError("Select at least one platform.");
    if (scheduleOn && !scheduledAt)
      return setError("Pick a date and time, or switch back to posting now.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mediaUrl: mediaUrl.trim() || undefined,
          mediaType: mediaUrl.trim() ? mediaType : undefined,
          platforms: Array.from(selected),
          scheduledAt: scheduleOn && scheduledAt
            ? new Date(scheduledAt).toISOString()
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Something went wrong");
      if (data.scheduled) {
        setScheduledConfirmation(data.scheduledAt);
      } else {
        setResults(data.results);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (scheduledConfirmation) {
    return (
      <div className="max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold">Post scheduled</h1>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-300">
          Your post will be published around{" "}
          <strong>{new Date(scheduledConfirmation).toLocaleString()}</strong> to{" "}
          {Array.from(selected).join(", ")}.
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setScheduledConfirmation(null);
              setContent("");
              setMediaUrl("");
              setMediaType("image");
              setScheduleOn(false);
              setScheduledAt("");
            }}
            className="px-4 py-2 rounded-lg border border-white/10 text-zinc-300 hover:bg-white/[0.04] text-sm font-medium transition-colors"
          >
            Compose another
          </button>
          <Link
            href="/analytics"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-semibold transition-colors"
          >
            View post history
          </Link>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold">Post Results</h1>
        <ul className="space-y-3">
          {Object.entries(results).map(([platform, r]) => (
            <li
              key={platform}
              className={`rounded-xl border p-4 flex items-start gap-3 ${r.ok ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-950/30 border-red-500/20"}`}
            >
              <span className={`text-sm font-semibold w-24 ${r.ok ? "text-emerald-400" : "text-red-400"}`}>
                {platform}
              </span>
              <div className="text-sm">
                {r.ok ? (
                  r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">
                      View post
                    </a>
                  ) : (
                    <span className="text-emerald-400">Posted!</span>
                  )
                ) : (
                  <span className="text-red-400">{r.error}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <button
            onClick={() => { setResults(null); setContent(""); setMediaUrl(""); setMediaType("image"); setUploading(false); }}
            className="px-4 py-2 rounded-lg border border-white/10 text-zinc-300 hover:bg-white/[0.04] text-sm font-medium transition-colors"
          >
            Post Again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">New Post</h1>
      </div>

      <section className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Post to</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const isConnected = connected.has(p.provider);
            if (!isConnected) {
              return (
                <Link
                  key={p.id}
                  href="/dashboard"
                  title={`Connect ${p.label} first`}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:border-white/20 hover:text-zinc-400"
                >
                  <span>{p.icon}</span>
                  {p.label}
                  <span className="ml-1 text-[10px] uppercase tracking-wide text-zinc-700">
                    connect
                  </span>
                </Link>
              );
            }
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  selected.has(p.id)
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300"
                }`}
              >
                <span>{p.icon}</span>
                {p.label}
              </button>
            );
          })}
        </div>
        {connected.size === 0 && (
          <p className="text-xs text-zinc-500">
            No accounts connected yet —{" "}
            <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">
              connect one
            </Link>{" "}
            to start posting.
          </p>
        )}
      </section>

      <section className="space-y-2">
        <label className="text-sm font-medium text-zinc-400" htmlFor="content">
          Content
          <span className="ml-2 text-zinc-600">({content.length} chars)</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="What's on your mind?"
          className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
        />
      </section>

      <section className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">
          Media <span className="text-zinc-600">(image or video — required for Instagram, TikTok, YouTube)</span>
        </label>

        {!mediaUrl ? (
          <label
            htmlFor="media-file"
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-8 cursor-pointer hover:border-indigo-500/40 transition-colors ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            {uploading ? (
              <svg className="h-8 w-8 text-indigo-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
              </svg>
            )}
            <span className="text-sm text-zinc-400">{uploading ? "Uploading…" : "Click to attach a video or image"}</span>
            {!uploading && <span className="text-xs text-zinc-600">or paste a URL below</span>}
            <input
              id="media-file"
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                setError("");
                try {
                  const fd = new FormData();
                  fd.append("file", file);
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error ?? "Upload failed");
                  setMediaUrl(data.url);
                  setMediaType(file.type.startsWith("video/") ? "video" : "image");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Upload failed");
                } finally {
                  setUploading(false);
                }
              }}
            />
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => handleMediaUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 w-full max-w-md rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-center"
            />
          </label>
        ) : (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-3">
            {mediaType === "video" ? (
              <video
                src={mediaUrl}
                controls
                className="w-full max-h-64 rounded-lg object-contain bg-black"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt="Media preview"
                className="w-full max-h-64 rounded-lg object-contain bg-black"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const video = document.createElement("video");
                    video.src = mediaUrl;
                    video.controls = true;
                    video.className = "w-full max-h-64 rounded-lg object-contain bg-black";
                    parent.replaceChild(video, e.currentTarget);
                  }
                }}
              />
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 truncate max-w-[80%]">{mediaUrl}</span>
              <button
                type="button"
                onClick={() => { setMediaUrl(""); setMediaType("image"); }}
                className="text-xs text-red-400 hover:text-red-300 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </section>

      {/* When to post */}
      <section className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">When</label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setScheduleOn(false)}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              !scheduleOn
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300"
            }`}
          >
            Post now
          </button>
          <button
            type="button"
            onClick={() => setScheduleOn(true)}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              scheduleOn
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300"
            }`}
          >
            Schedule
          </button>
          {scheduleOn && (
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
              className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
            />
          )}
        </div>
        {scheduleOn && (
          <p className="text-xs text-zinc-600">
            Scheduled posts publish within the cron window after the chosen time.
          </p>
        )}
      </section>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/30 border border-red-500/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handlePost}
        disabled={loading || uploading || !content.trim()}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold transition-colors"
      >
        {loading
          ? scheduleOn ? "Scheduling…" : "Posting…"
          : uploading
            ? "Uploading media…"
            : scheduleOn
              ? `Schedule for ${selected.size} platform${selected.size !== 1 ? "s" : ""}`
              : `Post to ${selected.size} platform${selected.size !== 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
