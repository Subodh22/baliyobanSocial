import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Features — baliyoban",
  description: "Everything you need to manage social media at scale. One API, 15 platforms.",
};

const FEATURES: {
  title: string;
  desc: string;
  platforms?: string;
  status: "live" | "soon";
}[] = [
  {
    title: "Multi-Platform Publishing",
    desc: "Post text, images, and video to every connected platform from one composer — automatically formatted for each platform.",
    platforms: "Live: Instagram, Facebook, TikTok, YouTube · Planned: Twitter/X, LinkedIn, Threads, Reddit, Pinterest, Bluesky, Telegram, Snapchat, Google Business, Discord, WhatsApp",
    status: "live",
  },
  {
    title: "Unified Inbox",
    desc: "Comments and DMs in one inbox — read and reply without switching apps. Live for Gmail, Instagram, and TikTok today.",
    status: "live",
  },
  {
    title: "No Developer Apps Needed",
    desc: "We handle all platform developer apps, approvals, and quota limits. Connect accounts via OAuth in seconds.",
    status: "live",
  },
  {
    title: "Scheduling",
    desc: "Schedule posts for optimal engagement times. Set it and forget it — baliyoban handles timezone conversion and platform-specific timing.",
    status: "soon",
  },
  {
    title: "Unified Analytics",
    desc: "Track impressions, engagements, clicks, and follower growth across every platform from a single dashboard.",
    status: "soon",
  },
  {
    title: "Public REST API",
    desc: "One API call to post everywhere. API keys, webhooks, and full reference docs are in development.",
    status: "soon",
  },
  {
    title: "MCP Server for AI Agents",
    desc: "Let AI agents post, schedule, analyze, and manage DMs via natural language from Claude Desktop, Cursor, or any MCP-compatible client.",
    status: "soon",
  },
  {
    title: "Ad Campaign Management",
    desc: "Boost any organic post to a paid ad. Set budgets, targeting, and duration — all from one place.",
    platforms: "Meta Ads, Google Ads, LinkedIn Ads, TikTok Ads, Pinterest Ads, X Ads",
    status: "soon",
  },
  {
    title: "White-Label Ready",
    desc: "Your users never see baliyoban branding. Build your own social media product on top of our infrastructure.",
    status: "soon",
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
            Publishing and a unified inbox are live today. The rest of the
            platform is shipping in the open — see the{" "}
            <Link href="/roadmap" className="text-zinc-200 underline">roadmap</Link>.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-zinc-100">{f.title}</h3>
                {f.status === "live" ? (
                  <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" /> Live
                  </span>
                ) : (
                  <span className="mt-1 shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                    Coming soon
                  </span>
                )}
              </div>
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
