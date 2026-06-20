import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingNav } from "@/app/components/marketing-nav";

const PLATFORMS: Record<
  string,
  { name: string; description: string; features: string[]; status: "live" | "planned" }
> = {
  "twitter": {
    name: "Twitter/X",
    description:
      "Publish tweets, threads, and media to Twitter/X. Manage replies and engagement from a unified inbox.",
    features: [
      "Post text, images, and video",
      "Schedule tweets for optimal timing",
      "Track impressions, likes, retweets, and replies",
      "Manage replies from the unified inbox",
    ],
    status: "live",
  },
  "instagram": {
    name: "Instagram",
    description:
      "Publish photos, carousels, reels, and stories to Instagram. Manage comments and DMs from one place.",
    features: [
      "Post photos, carousels, and reels",
      "Schedule posts in advance",
      "Track reach, impressions, and engagement",
      "Reply to comments and DMs from the unified inbox",
    ],
    status: "live",
  },
  "tiktok": {
    name: "TikTok",
    description:
      "Upload and publish videos to TikTok. Track views, likes, and comments from the dashboard.",
    features: [
      "Upload and publish videos",
      "Schedule video posts",
      "Track views, likes, shares, and comments",
      "Reply to comments from the unified inbox",
    ],
    status: "live",
  },
  "whatsapp": {
    name: "WhatsApp",
    description:
      "Send messages and updates to WhatsApp Business contacts. Manage conversations from the unified inbox.",
    features: [
      "Send text and media messages",
      "Manage business conversations",
      "Automate customer engagement",
      "Track message delivery and read receipts",
    ],
    status: "planned",
  },
  "linkedin": {
    name: "LinkedIn",
    description:
      "Publish posts, articles, and updates to LinkedIn profiles and company pages.",
    features: [
      "Post text, images, and documents",
      "Publish to personal profiles and company pages",
      "Schedule posts for peak business hours",
      "Track impressions, clicks, and engagement",
    ],
    status: "live",
  },
  "facebook": {
    name: "Facebook",
    description:
      "Publish posts, photos, and videos to Facebook Pages. Track reach and engagement from the dashboard.",
    features: [
      "Post to Facebook Pages",
      "Upload photos, videos, and carousels",
      "Schedule posts in advance",
      "Track reach, impressions, and engagement",
    ],
    status: "live",
  },
  "youtube": {
    name: "YouTube",
    description:
      "Upload videos and shorts to YouTube. Manage comments and track analytics from one dashboard.",
    features: [
      "Upload videos and shorts",
      "Set titles, descriptions, and tags",
      "Track views, watch time, and subscribers",
      "Manage comments from the unified inbox",
    ],
    status: "live",
  },
  "threads": {
    name: "Threads",
    description:
      "Publish text posts and media to Threads by Meta. Engage with your audience from the unified inbox.",
    features: [
      "Post text and media",
      "Schedule posts",
      "Track engagement metrics",
      "Reply to conversations",
    ],
    status: "planned",
  },
  "reddit": {
    name: "Reddit",
    description:
      "Submit posts and links to Reddit communities. Track upvotes, comments, and engagement.",
    features: [
      "Submit text posts and links",
      "Post to multiple subreddits",
      "Track upvotes and comments",
      "Schedule posts for peak activity",
    ],
    status: "planned",
  },
  "pinterest": {
    name: "Pinterest",
    description:
      "Create and schedule pins to Pinterest boards. Drive traffic with visual content.",
    features: [
      "Create standard and video pins",
      "Organize pins across boards",
      "Schedule pins for optimal reach",
      "Track impressions, saves, and clicks",
    ],
    status: "planned",
  },
  "bluesky": {
    name: "Bluesky",
    description:
      "Post to Bluesky and engage with the decentralized social network from one dashboard.",
    features: [
      "Post text and media",
      "Schedule posts",
      "Track engagement",
      "Manage replies and mentions",
    ],
    status: "planned",
  },
  "telegram": {
    name: "Telegram",
    description:
      "Send messages to Telegram channels and groups. Automate content distribution.",
    features: [
      "Post to channels and groups",
      "Send text, images, and video",
      "Schedule messages",
      "Track message views",
    ],
    status: "planned",
  },
  "snapchat": {
    name: "Snapchat",
    description:
      "Publish stories and content to Snapchat. Reach younger audiences with visual content.",
    features: [
      "Post stories and spotlight content",
      "Upload images and short videos",
      "Track views and engagement",
      "Schedule content in advance",
    ],
    status: "planned",
  },
  "google-business": {
    name: "Google Business",
    description:
      "Publish updates, offers, and events to your Google Business Profile. Improve local visibility.",
    features: [
      "Post updates and offers",
      "Share events and announcements",
      "Upload photos",
      "Track post views and actions",
    ],
    status: "planned",
  },
  "discord": {
    name: "Discord",
    description:
      "Send messages and announcements to Discord servers. Manage community engagement.",
    features: [
      "Post to channels and threads",
      "Send rich embeds and media",
      "Schedule announcements",
      "Track message engagement",
    ],
    status: "planned",
  },
  "meta-ads": {
    name: "Meta Ads",
    description:
      "Create and manage ad campaigns across Facebook and Instagram. Boost posts and track ROI from one dashboard.",
    features: [
      "Boost organic posts to paid ads",
      "Set budgets and targeting",
      "Track impressions, clicks, and conversions",
      "Manage campaigns across Facebook and Instagram",
    ],
    status: "planned",
  },
  "google-ads": {
    name: "Google Ads",
    description:
      "Run search, display, and video ad campaigns on Google. Manage budgets and track performance.",
    features: [
      "Create search and display campaigns",
      "Promote YouTube videos",
      "Set budgets and bidding strategies",
      "Track clicks, conversions, and ROI",
    ],
    status: "planned",
  },
};

const SLUGS = Object.keys(PLATFORMS);

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const platform = PLATFORMS[slug];
  if (!platform) return {};
  return {
    title: `${platform.name} Integration — baliyoban`,
    description: platform.description,
  };
}

export default async function IntegrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const platform = PLATFORMS[slug];
  if (!platform) notFound();

  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <MarketingNav />

      <div className="mx-auto max-w-3xl px-6 py-20 space-y-12">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {platform.name}
            </h1>
            {platform.status === "live" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
              </span>
            ) : (
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-zinc-500">
                Coming soon
              </span>
            )}
          </div>
          <p className="mt-4 text-lg text-zinc-400">{platform.description}</p>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">What you can do</h2>
          <ul className="mt-4 space-y-3">
            {platform.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[15px] text-zinc-300">
                <span className="mt-1 text-indigo-400">&#10003;</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-zinc-100">How it works</h2>
          <ol className="mt-4 space-y-3 text-sm text-zinc-400">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-zinc-300">1</span>
              <span>Sign up for a free baliyoban account</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-zinc-300">2</span>
              <span>Connect your {platform.name} account via OAuth — no developer app needed</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-zinc-300">3</span>
              <span>Start posting from the dashboard, API, or MCP server</span>
            </li>
          </ol>
        </section>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/sign-up"
            className="inline-block rounded-lg bg-[#EB3514] px-8 py-3.5 text-lg font-semibold text-white transition-opacity hover:opacity-90"
          >
            Start for Free
          </Link>
          <Link
            href="/features"
            className="inline-block rounded-lg border border-white/10 px-8 py-3.5 text-lg font-semibold text-zinc-300 transition-colors hover:bg-white/[0.04]"
          >
            See All Features
          </Link>
        </div>
      </div>
    </main>
  );
}
