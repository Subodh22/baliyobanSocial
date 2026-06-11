"use client";

import Link from "next/link";
import { formatCount } from "@/lib/format";
import { useCachedFetch } from "../inbox/use-cached-fetch";

type PlatformResult = { ok?: boolean; url?: string; error?: string };

type AnalyticsData = {
  totals: { posts: number; succeeded: number; failed: number };
  perPlatform: Record<string, { posts: number; succeeded: number; failed: number }>;
  recent: {
    id: string;
    content: string;
    mediaUrl: string | null;
    createdAt: string;
    results: Record<string, PlatformResult>;
  }[];
};

type Video = {
  id: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter / X",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
};

function sum(videos: Video[], key: keyof Video): number {
  return videos.reduce((acc, v) => acc + (Number(v[key]) || 0), 0);
}

function EngagementCard({
  label,
  videos,
  countLabel,
}: {
  label: string;
  videos: Video[];
  countLabel: string;
}) {
  const views = sum(videos, "view_count");
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-sm font-semibold text-zinc-200">{label}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-xl font-bold text-zinc-100">{videos.length}</p>
          <p className="text-xs text-zinc-500">{countLabel}</p>
        </div>
        {views > 0 && (
          <div>
            <p className="text-xl font-bold text-zinc-100">{formatCount(views)}</p>
            <p className="text-xs text-zinc-500">Views</p>
          </div>
        )}
        <div>
          <p className="text-xl font-bold text-zinc-100">
            {formatCount(sum(videos, "like_count"))}
          </p>
          <p className="text-xs text-zinc-500">Likes</p>
        </div>
        <div>
          <p className="text-xl font-bold text-zinc-100">
            {formatCount(sum(videos, "comment_count"))}
          </p>
          <p className="text-xs text-zinc-500">Comments</p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsClient({
  hasTikTok,
  hasInstagram,
}: {
  hasTikTok: boolean;
  hasInstagram: boolean;
}) {
  const { data: analytics, loading } = useCachedFetch<AnalyticsData>(
    "/api/analytics"
  );
  const { data: tiktok } = useCachedFetch<{ videos: Video[] }>(
    hasTikTok ? "/api/connect/tiktok/videos" : null
  );
  const { data: instagram } = useCachedFetch<{ videos: Video[] }>(
    hasInstagram ? "/api/connect/instagram/videos" : null
  );

  const totals = analytics?.totals;
  const successRate =
    totals && totals.succeeded + totals.failed > 0
      ? Math.round((totals.succeeded / (totals.succeeded + totals.failed)) * 100)
      : null;

  return (
    <div className="mt-8 space-y-8">
      {/* Posting overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Posts created
          </p>
          <p className="mt-2 text-2xl font-bold text-zinc-100">
            {loading ? "…" : totals?.posts ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Publishes succeeded
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {loading ? "…" : totals?.succeeded ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Success rate
          </p>
          <p className="mt-2 text-2xl font-bold text-zinc-100">
            {loading ? "…" : successRate === null ? "—" : `${successRate}%`}
          </p>
        </div>
      </div>

      {/* Platform engagement (from connected platform APIs) */}
      {(hasTikTok || hasInstagram) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-200">
            Platform engagement
          </h2>
          {hasTikTok && tiktok?.videos && (
            <EngagementCard label="TikTok" videos={tiktok.videos} countLabel="Videos" />
          )}
          {hasInstagram && instagram?.videos && (
            <EngagementCard label="Instagram" videos={instagram.videos} countLabel="Posts" />
          )}
        </div>
      )}

      {/* Per-platform posting breakdown */}
      {analytics && Object.keys(analytics.perPlatform).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">
            Publishing by platform
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3 font-medium">Platform</th>
                  <th className="px-5 py-3 font-medium">Attempts</th>
                  <th className="px-5 py-3 font-medium">Succeeded</th>
                  <th className="px-5 py-3 font-medium">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {Object.entries(analytics.perPlatform).map(([platform, s]) => (
                  <tr key={platform} className="text-zinc-300">
                    <td className="px-5 py-3 font-medium">
                      {PLATFORM_LABELS[platform] ?? platform}
                    </td>
                    <td className="px-5 py-3">{s.posts}</td>
                    <td className="px-5 py-3 text-emerald-400">{s.succeeded}</td>
                    <td className="px-5 py-3 text-red-400">{s.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post history */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-200">Recent posts</h2>
        {!loading && (analytics?.recent.length ?? 0) === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-sm text-zinc-400">No posts yet.</p>
            <Link
              href="/compose"
              className="mt-3 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300"
            >
              Write your first post →
            </Link>
          </div>
        )}
        <div className="mt-4 space-y-3">
          {analytics?.recent.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="line-clamp-2 text-sm text-zinc-200">
                  {post.content || "(media only)"}
                </p>
                <span className="flex-shrink-0 text-xs text-zinc-600">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {Object.entries(post.results).map(([platform, r]) =>
                  r.ok && r.url ? (
                    <a
                      key={platform}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"
                    >
                      {PLATFORM_LABELS[platform] ?? platform} ↗
                    </a>
                  ) : (
                    <span
                      key={platform}
                      title={r.error}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        r.ok
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {PLATFORM_LABELS[platform] ?? platform}
                      {r.ok ? "" : " ✕"}
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
