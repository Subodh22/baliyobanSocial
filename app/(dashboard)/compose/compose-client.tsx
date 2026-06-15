"use client";

import { useState } from "react";
import Link from "next/link";
import TikTokOptions from "./tiktok-options";
import type { TikTokDirectPostOptions } from "@/lib/platforms/tiktok";
import { upload } from "@vercel/blob/client";

const PLATFORMS = [
  { id: "twitter",   label: "Twitter / X",     icon: "𝕏",  provider: "twitter" },
  { id: "facebook",  label: "Facebook",        icon: "f",   provider: "facebook" },
  { id: "instagram", label: "Instagram",       icon: "📷",  provider: "facebook", requiresMedia: true },
  { id: "linkedin",  label: "LinkedIn",        icon: "in",  provider: "linkedin" },
  { id: "tiktok",    label: "TikTok",          icon: "♪",   provider: "tiktok", requiresMedia: true },
  { id: "youtube",   label: "YouTube",         icon: "▶",   provider: "google", requiresMedia: true },
];

const VIDEO_RE = /\.(mp4|mov|webm|avi|mkv)(\?|$)/i;

type Result = { ok: boolean; url?: string; note?: string; error?: string };

const DEFAULT_TIKTOK_OPTIONS: TikTokDirectPostOptions = {
  privacyLevel: "",
  allowComment: false,
  allowDuet: false,
  allowStitch: false,
  yourBrand: false,
  brandedContent: false,
};

export default function ComposeClient({
  connectedProviders,
  tiktokDirectPost,
}: {
  connectedProviders: string[];
  tiktokDirectPost: boolean;
}) {
  const connected = new Set(connectedProviders);

  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(PLATFORMS.filter((p) => connected.has(p.provider)).map((p) => p.id))
  );
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, Result> | null>(null);
  const [error, setError] = useState("");
  const [scheduleOn, setScheduleOn] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduledConfirmation, setScheduledConfirmation] = useState<string | null>(null);
  const [tiktokOptions, setTiktokOptions] = useState<TikTokDirectPostOptions>(
    DEFAULT_TIKTOK_OPTIONS
  );
  const [tiktokReady, setTiktokReady] = useState(false);

  // The compliant Direct Post picker is shown only when Direct Post is enabled
  // and TikTok is a chosen target. Scheduled posts use inbox upload, which
  // needs no options.
  const showTikTokOptions =
    tiktokDirectPost && selected.has("tiktok") && !scheduleOn;

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

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    setUploadPct(0);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: ({ percentage }) => setUploadPct(percentage),
      });
      setMediaUrl(blob.url);
      setMediaType(file.type.startsWith("image/") ? "image" : "video");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handlePost() {
    if (!content.trim()) return setError("Write something first!");
    if (selected.size === 0) return setError("Select at least one platform.");
    if (scheduleOn && !scheduledAt)
      return setError("Pick a date and time, or switch back to posting now.");
    if (showTikTokOptions && !tiktokReady)
      return setError("Finish the TikTok options — choose who can view your post.");
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
          tiktok: showTikTokOptions ? tiktokOptions : undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return setError(data?.error ?? `Request failed (${res.status})`);
      if (!data) return setError("Empty response from server. Try again.");
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
      <div className="space-y-8">
        <h1 className="font-[family-name:var(--font-jetbrains-mono)] text-[21px] font-medium tracking-[-0.02em]">Post scheduled</h1>
        <div className="rounded border border-[#1F7A4D]/20 bg-green-50 p-5 text-sm text-[#1F7A4D]">
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
            className="px-[15px] py-[9px] rounded border border-[#DEDEDE] text-[#0A0A0A] hover:bg-[#F6F6F6] text-[13px] font-[450] transition-colors"
          >
            Compose another
          </button>
          <Link
            href="/analytics"
            className="px-[15px] py-[9px] rounded bg-[#0A0A0A] text-white hover:opacity-85 text-[13px] font-medium transition-opacity"
          >
            View post history
          </Link>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="space-y-8">
        <h1 className="font-[family-name:var(--font-jetbrains-mono)] text-[21px] font-medium tracking-[-0.02em]">Post Results</h1>
        <ul className="space-y-3">
          {Object.entries(results).map(([platform, r]) => (
            <li
              key={platform}
              className={`rounded border p-4 flex items-start gap-3 ${r.ok ? "bg-green-50 border-[#1F7A4D]/20" : "bg-red-50 border-[#CC2A1E]/20"}`}
            >
              <span className={`text-sm font-semibold w-24 ${r.ok ? "text-[#1F7A4D]" : "text-[#CC2A1E]"}`}>
                {platform}
              </span>
              <div className="text-sm">
                {r.ok ? (
                  r.note ? (
                    <span className="text-[#1F7A4D]">{r.note}</span>
                  ) : r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[#0A0A0A] underline">
                      View post
                    </a>
                  ) : (
                    <span className="text-[#1F7A4D]">Posted!</span>
                  )
                ) : (
                  <span className="text-[#CC2A1E]">{r.error}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <button
            onClick={() => { setResults(null); setContent(""); setMediaUrl(""); setMediaType("image"); setUploading(false); }}
            className="px-[15px] py-[9px] rounded border border-[#DEDEDE] text-[#0A0A0A] hover:bg-[#F6F6F6] text-[13px] font-[450] transition-colors"
          >
            Post Again
          </button>
          <Link
            href="/dashboard"
            className="px-[15px] py-[9px] rounded bg-[#0A0A0A] text-white hover:opacity-85 text-[13px] font-medium transition-opacity"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[22px]">
      <div className="mb-11">
        <h1 className="font-[family-name:var(--font-jetbrains-mono)] text-[21px] font-medium tracking-[-0.02em]">New post</h1>
        <p className="mt-1.5 text-sm text-[#5A5A5A]">Write once, publish to every connected account.</p>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#0A0A0A] mb-[7px]">Publish to</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const isConnected = connected.has(p.provider);
            if (!isConnected) {
              return (
                <Link
                  key={p.id}
                  href="/dashboard"
                  title={`Connect ${p.label} first`}
                  className="inline-flex items-center gap-[7px] border border-dashed border-[#DEDEDE] rounded px-[13px] py-2 text-[13px] font-[450] text-[#C2C2C2] cursor-not-allowed"
                >
                  <span>{p.icon}</span>
                  {p.label}
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.04em] text-[#C2C2C2]">
                    connect
                  </span>
                </Link>
              );
            }
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`inline-flex items-center gap-[7px] border rounded px-[13px] py-2 text-[13px] font-[450] transition-all ${
                  selected.has(p.id)
                    ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                    : "bg-white text-[#5A5A5A] border-[#DEDEDE] hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
                }`}
              >
                <span>{p.icon}</span>
                {p.label}
              </button>
            );
          })}
        </div>
        {connected.size === 0 && (
          <p className="mt-2 text-xs text-[#969696]">
            No accounts connected yet —{" "}
            <Link href="/dashboard" className="text-[#0A0A0A] underline">
              connect one
            </Link>{" "}
            to start posting.
          </p>
        )}
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#0A0A0A] mb-[7px]" htmlFor="content">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="What's on your mind?"
          className="w-full rounded border border-[#DEDEDE] bg-white p-[13px] text-[13.5px] text-[#0A0A0A] placeholder-[#969696] focus:outline-none focus:border-[#0A0A0A] resize-vertical leading-relaxed"
        />
        <p className="mt-[7px] text-xs text-[#969696] font-[family-name:var(--font-jetbrains-mono)]">{content.length} characters</p>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#0A0A0A] mb-[7px]">Media</label>

        {!mediaUrl ? (
          <label
            htmlFor="media-file"
            className={`flex flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-[#DEDEDE] bg-white p-[34px] cursor-pointer hover:border-[#0A0A0A] transition-colors ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            {uploading ? (
              <svg className="h-6 w-6 text-[#969696] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6 text-[#969696]">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            )}
            <span className="text-sm text-[#5A5A5A]">
              {uploading ? `Uploading… ${Math.round(uploadPct)}%` : "Drag a video, image, or audio file here"}
            </span>
            {!uploading && <span className="text-xs text-[#969696] font-[family-name:var(--font-jetbrains-mono)]">or paste a URL — required for Instagram, TikTok, YouTube</span>}
            {uploading && (
              <div className="w-full max-w-md h-1.5 rounded-full bg-[#E8E8E8] overflow-hidden">
                <div
                  className="h-full bg-[#0A0A0A] transition-all"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
            )}
            <input
              id="media-file"
              type="file"
              accept="video/*,image/*,audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) handleFile(file);
              }}
            />
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => handleMediaUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 w-full max-w-md rounded border border-[#DEDEDE] bg-white p-2 text-sm text-[#0A0A0A] placeholder-[#969696] focus:outline-none focus:border-[#0A0A0A] text-center"
            />
          </label>
        ) : (
          <div className="rounded border border-[#E8E8E8] bg-white p-3 space-y-3">
            {mediaType === "video" ? (
              <video
                src={mediaUrl}
                controls
                className="w-full max-h-64 rounded object-contain bg-[#F6F6F6]"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt="Media preview"
                className="w-full max-h-64 rounded object-contain bg-[#F6F6F6]"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const video = document.createElement("video");
                    video.src = mediaUrl;
                    video.controls = true;
                    video.className = "w-full max-h-64 rounded object-contain bg-[#F6F6F6]";
                    parent.replaceChild(video, e.currentTarget);
                  }
                }}
              />
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#969696] truncate max-w-[80%]">{mediaUrl}</span>
              <button
                type="button"
                onClick={() => { setMediaUrl(""); setMediaType("image"); }}
                className="text-xs text-[#CC2A1E] hover:opacity-70 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {showTikTokOptions && (
        <section className="space-y-2">
          <label className="text-sm font-medium text-[#5A5A5A]">TikTok</label>
          <TikTokOptions
            value={tiktokOptions}
            onChange={setTiktokOptions}
            onValidityChange={setTiktokReady}
          />
        </section>
      )}

      {selected.has("tiktok") && !showTikTokOptions && (
        <div className="text-[12.5px] text-[#5A5A5A] bg-[#F6F6F6] border border-[#E8E8E8] rounded p-[14px] leading-relaxed">
          TikTok posts are sent to your TikTok inbox — open the app and tap the
          notification to finish posting.
        </div>
      )}

      {error && (
        <p className="text-sm text-[#CC2A1E] bg-red-50 border border-[#CC2A1E]/20 rounded px-4 py-2">
          {error}
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-3 rounded border border-[#E8E8E8] bg-[#F6F6F6] px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-[#969696] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-[#0A0A0A]">
              {scheduleOn ? "Scheduling your post…" : "Publishing to your platforms…"}
            </p>
            {mediaType === "video" && !scheduleOn && (
              <p className="text-[#969696] text-xs mt-0.5">
                Video processing can take up to a minute — please don&apos;t close this page.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-[10px]">
        <button
          onClick={handlePost}
          disabled={loading || uploading || !content.trim()}
          className="inline-flex items-center gap-[7px] bg-[#0A0A0A] text-white border border-[#0A0A0A] rounded px-[15px] py-[9px] text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          {loading
            ? scheduleOn ? "Scheduling…" : "Posting…"
            : uploading
              ? "Uploading media…"
              : scheduleOn
                ? `Schedule for ${selected.size} platform${selected.size !== 1 ? "s" : ""}`
                : "Publish now"}
        </button>
        <button
          type="button"
          onClick={() => setScheduleOn(!scheduleOn)}
          className={`inline-flex items-center gap-[7px] rounded px-[15px] py-[9px] text-[13px] font-[450] transition-colors ${
            scheduleOn
              ? "bg-[#0A0A0A] text-white border border-[#0A0A0A]"
              : "bg-white text-[#0A0A0A] border border-[#DEDEDE] hover:bg-[#F6F6F6]"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          Schedule
        </button>
      </div>
      {scheduleOn && (
        <div className="space-y-2">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
            className="rounded border border-[#DEDEDE] bg-white px-[13px] py-[10px] text-[13.5px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
          />
          <p className="text-xs text-[#969696] font-[family-name:var(--font-jetbrains-mono)]">
            Scheduled posts publish within the cron window after the chosen time.
          </p>
        </div>
      )}
    </div>
  );
}
