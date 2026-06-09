import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Features — baliyoban",
  description: "Everything you need to manage social media at scale. One API, 15 platforms.",
};

const FEATURES = [
  {
    title: "Multi-Platform Publishing",
    desc: "Post to 15 social platforms with a single API call. Text, images, videos, and carousels — automatically formatted for each platform.",
    platforms: "Twitter/X, Instagram, Facebook, LinkedIn, TikTok, YouTube, Threads, Reddit, Pinterest, Bluesky, Telegram, Snapchat, Google Business, Discord, WhatsApp",
  },
  {
    title: "Scheduling",
    desc: "Schedule posts for optimal engagement times. Set it and forget it — baliyoban handles timezone conversion and platform-specific timing.",
  },
  {
    title: "Unified Analytics",
    desc: "Track impressions, engagements, clicks, and follower growth across every platform from a single dashboard. Export reports in CSV or JSON.",
  },
  {
    title: "Ad Campaign Management",
    desc: "Boost any organic post to a paid ad across 6 ad networks. Set budgets, targeting, and duration — all through one API.",
    platforms: "Meta Ads, Google Ads, LinkedIn Ads, TikTok Ads, Pinterest Ads, X Ads",
  },
  {
    title: "Unified Inbox",
    desc: "DMs, comments, mentions, and reviews from every platform in one inbox. Reply via API or dashboard without switching apps.",
  },
  {
    title: "Webhook Notifications",
    desc: "Get notified in real-time when posts are published, fail, or receive engagement. No polling required.",
  },
  {
    title: "MCP Server for AI Agents",
    desc: "280+ tools for Claude Desktop, Cursor, and any MCP-compatible client. Let AI agents post, schedule, analyze, and manage DMs via natural language.",
  },
  {
    title: "White-Label Ready",
    desc: "Your users never see baliyoban branding. Build your own social media product on top of our infrastructure.",
  },
  {
    title: "No Developer Apps Needed",
    desc: "We handle all platform developer apps, approvals, and quota limits. Connect accounts via OAuth in seconds.",
  },
];

export default function Features() {
  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <MarketingNav />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need for social media at scale
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            One API. 15 platforms. Every feature your product needs.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-lg font-semibold text-zinc-100">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
              {f.platforms && (
                <p className="mt-3 text-xs text-zinc-600">{f.platforms}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/sign-up"
            className="inline-block rounded-lg bg-[#EB3514] px-8 py-3.5 text-lg font-semibold text-white transition-opacity hover:opacity-90"
          >
            Start for Free
          </Link>
          <p className="mt-3 text-sm text-zinc-500">No credit card required</p>
        </div>
      </div>
    </main>
  );
}
