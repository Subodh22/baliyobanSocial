"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PLATFORMS = [
  { id: "twitter",   label: "Twitter / X",     icon: "𝕏",  textOnly: false },
  { id: "facebook",  label: "Facebook",        icon: "f",   textOnly: false },
  { id: "instagram", label: "Instagram",       icon: "📷",  textOnly: false, requiresMedia: true },
  { id: "linkedin",  label: "LinkedIn",        icon: "in",  textOnly: false },
  { id: "tiktok",    label: "TikTok",          icon: "♪",   textOnly: false, requiresMedia: true },
  { id: "youtube",   label: "YouTube",         icon: "▶",   textOnly: false, requiresMedia: true },
];

type Result = { ok: boolean; url?: string; error?: string };

export default function Compose() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(["twitter", "facebook", "linkedin"]));
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, Result> | null>(null);
  const [error, setError] = useState("");

  function togglePlatform(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handlePost() {
    if (!content.trim()) return setError("Write something first!");
    if (selected.size === 0) return setError("Select at least one platform.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mediaUrl: mediaUrl.trim() || undefined,
          platforms: Array.from(selected),
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Something went wrong");
      setResults(data.results);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (results) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <h1 className="text-3xl font-bold">Post Results</h1>
        <ul className="space-y-3">
          {Object.entries(results).map(([platform, r]) => (
            <li
              key={platform}
              className={`rounded-xl border p-4 flex items-start gap-3 ${r.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <span className={`text-sm font-semibold w-24 ${r.ok ? "text-green-700" : "text-red-700"}`}>
                {platform}
              </span>
              <div className="text-sm">
                {r.ok ? (
                  r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
                      View post
                    </a>
                  ) : (
                    <span className="text-green-700">Posted!</span>
                  )
                ) : (
                  <span className="text-red-700">{r.error}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <button
            onClick={() => { setResults(null); setContent(""); setMediaUrl(""); }}
            className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-sm font-medium transition-colors"
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
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">New Post</h1>
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">
          ← Dashboard
        </Link>
      </div>

      <section className="space-y-2">
        <label className="text-sm font-medium text-zinc-600">Post to</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePlatform(p.id)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors flex items-center gap-1.5 ${
                selected.has(p.id)
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-white border-zinc-300 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <label className="text-sm font-medium text-zinc-600" htmlFor="content">
          Content
          <span className="ml-2 text-zinc-400">({content.length} chars)</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="What's on your mind?"
          className="w-full rounded-xl bg-white border border-zinc-300 p-4 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
        />
      </section>

      <section className="space-y-2">
        <label className="text-sm font-medium text-zinc-400" htmlFor="media">
          Media URL <span className="text-zinc-600">(image or video — required for Instagram, TikTok, YouTube)</span>
        </label>
        <input
          id="media"
          type="url"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
        />
      </section>

      {error && (
        <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handlePost}
        disabled={loading || !content.trim()}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold transition-colors"
      >
        {loading ? "Posting…" : `Post to ${selected.size} platform${selected.size !== 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
