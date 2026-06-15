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
    status: string;
    scheduledAt: string | null;
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
    <div className="border border-[#E8E8E8] rounded p-5">
      <p className="text-sm font-medium text-[#0A0A0A]">{label}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-xl font-bold text-[#0A0A0A]">{videos.length}</p>
          <p className="text-xs text-[#5A5A5A]">{countLabel}</p>
        </div>
        {views > 0 && (
          <div>
            <p className="text-xl font-bold text-[#0A0A0A]">{formatCount(views)}</p>
            <p className="text-xs text-[#5A5A5A]">Views</p>
          </div>
        )}
        <div>
          <p className="text-xl font-bold text-[#0A0A0A]">
            {formatCount(sum(videos, "like_count"))}
          </p>
          <p className="text-xs text-[#5A5A5A]">Likes</p>
        </div>
        <div>
          <p className="text-xl font-bold text-[#0A0A0A]">
            {formatCount(sum(videos, "comment_count"))}
          </p>
          <p className="text-xs text-[#5A5A5A]">Comments</p>
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
      <div className="grid grid-cols-3 border border-[#E8E8E8] rounded overflow-hidden">
        <div className="p-5 border-r border-[#E8E8E8]">
          <p className="font-[family-name:var(--font-jetbrains-mono)] text-[30px] font-medium tracking-[-0.03em] leading-none mb-2">
            {loading ? "…" : totals?.posts ?? 0}
          </p>
          <p className="text-xs text-[#5A5A5A] font-[450]">Posts created</p>
        </div>
        <div className="p-5 border-r border-[#E8E8E8]">
          <p className="font-[family-name:var(--font-jetbrains-mono)] text-[30px] font-medium tracking-[-0.03em] leading-none mb-2">
            {loading ? "…" : totals?.succeeded ?? 0}
          </p>
          <p className="text-xs text-[#5A5A5A] font-[450]">Publishes succeeded</p>
        </div>
        <div className="p-5">
          <p className="font-[family-name:var(--font-jetbrains-mono)] text-[30px] font-medium tracking-[-0.03em] leading-none mb-2">
            {loading ? "…" : successRate === null ? "—" : <>{successRate}<span className="text-lg text-[#969696]">%</span></>}
          </p>
          <p className="text-xs text-[#5A5A5A] font-[450]">Success rate</p>
        </div>
      </div>

      {/* Platform engagement */}
      {(hasTikTok || hasInstagram) && (
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.04em] text-[#969696]">Engagement</span>
          </div>
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
          <div className="flex items-baseline justify-between mb-[18px]">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.04em] text-[#969696]">Publishing by platform</span>
          </div>
          <div className="border border-[#E8E8E8] rounded overflow-hidden">
            <div className="flex gap-4 px-5 py-[11px] bg-[#F6F6F6] border-b border-[#E8E8E8] font-[family-name:var(--font-jetbrains-mono)] text-[10.5px] font-medium text-[#969696] uppercase tracking-[0.04em]">
              <div className="flex-[2] min-w-0">Platform</div>
              <div className="flex-1 min-w-0">Attempts</div>
              <div className="flex-1 min-w-0">Succeeded</div>
              <div className="flex-1 min-w-0">Failed</div>
            </div>
            {Object.entries(analytics.perPlatform).map(([platform, s], i, arr) => (
              <div key={platform} className={`flex gap-4 px-5 py-[15px] items-center transition-colors hover:bg-[#F6F6F6] ${i < arr.length - 1 ? "border-b border-[#E8E8E8]" : ""}`}>
                <div className="flex-[2] min-w-0 flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-[#0A0A0A] text-white text-xs font-bold shrink-0">
                    {platform === "tiktok" ? "♪" : platform === "linkedin" ? "in" : platform.charAt(0).toUpperCase()}
                  </div>
                  {PLATFORM_LABELS[platform] ?? platform}
                </div>
                <div className="flex-1 min-w-0 font-[family-name:var(--font-jetbrains-mono)]">{s.posts}</div>
                <div className="flex-1 min-w-0 font-[family-name:var(--font-jetbrains-mono)] text-[#1F7A4D]">{s.succeeded}</div>
                <div className="flex-1 min-w-0 font-[family-name:var(--font-jetbrains-mono)] text-[#CC2A1E]">{s.failed}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post history */}
      <div>
        <div className="flex items-baseline justify-between mb-[18px]">
          <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.04em] text-[#969696]">Recent posts</span>
        </div>
        {!loading && (analytics?.recent.length ?? 0) === 0 && (
          <div className="rounded border border-dashed border-[#DEDEDE] bg-white px-6 py-12 text-center">
            <p className="text-sm text-[#5A5A5A]">No posts yet.</p>
            <Link
              href="/compose"
              className="mt-3 inline-block text-sm font-medium text-[#0A0A0A] underline"
            >
              Write your first post &rarr;
            </Link>
          </div>
        )}
        {analytics && analytics.recent.length > 0 && (
          <div className="border border-[#E8E8E8] rounded overflow-hidden">
            <div className="flex gap-4 px-5 py-[11px] bg-[#F6F6F6] border-b border-[#E8E8E8] font-[family-name:var(--font-jetbrains-mono)] text-[10.5px] font-medium text-[#969696] uppercase tracking-[0.04em]">
              <div className="flex-[2] min-w-0">Content</div>
              <div className="flex-1 min-w-0">Platform</div>
              <div className="flex-1 min-w-0">Date</div>
            </div>
            {analytics.recent.map((post, i) => (
              <div
                key={post.id}
                className={`flex gap-4 px-5 py-[15px] items-center transition-colors hover:bg-[#F6F6F6] ${i < analytics.recent.length - 1 ? "border-b border-[#E8E8E8]" : ""}`}
              >
                <div className="flex-[2] min-w-0 truncate text-sm">
                  {post.content || "(media only)"}
                </div>
                <div className="flex-1 min-w-0 flex flex-wrap gap-1">
                  {post.status === "scheduled" && (
                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10.5px] font-medium text-[#9A6B00] bg-amber-50 border border-[#9A6B00]/20 px-[7px] py-[2px] rounded-[3px]">
                      Scheduled
                    </span>
                  )}
                  {Object.entries(post.results).map(([platform, r]) => (
                    <span
                      key={platform}
                      className={`font-[family-name:var(--font-jetbrains-mono)] text-[10.5px] font-medium px-[7px] py-[2px] rounded-[3px] border ${
                        r.ok
                          ? "text-[#1F7A4D] bg-green-50 border-[#1F7A4D]/20"
                          : "text-[#CC2A1E] bg-red-50 border-[#CC2A1E]/20"
                      }`}
                    >
                      {PLATFORM_LABELS[platform] ?? platform}
                    </span>
                  ))}
                </div>
                <div className="flex-1 min-w-0 font-[family-name:var(--font-jetbrains-mono)] text-[#969696] text-sm">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
