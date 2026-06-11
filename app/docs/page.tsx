import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Documentation — baliyoban",
  description: "API reference, guides, and SDKs for baliyoban.",
};

const SECTIONS = [
  {
    title: "Getting Started",
    links: [
      { label: "Quick Start Guide", desc: "Sign up, get your API key, and make your first post in 5 minutes" },
      { label: "Authentication", desc: "How to authenticate with the baliyoban API using Bearer tokens" },
      { label: "Connecting Accounts", desc: "Link social platforms via OAuth without managing developer apps" },
    ],
  },
  {
    title: "Core API",
    links: [
      { label: "POST /v1/posts", desc: "Publish content to one or more platforms in a single call" },
      { label: "GET /v1/posts", desc: "List all posts with filtering by platform, status, and date" },
      { label: "POST /v1/posts/schedule", desc: "Schedule a post for future delivery" },
      { label: "DELETE /v1/posts/:id", desc: "Delete a post from all platforms" },
    ],
  },
  {
    title: "Connections",
    links: [
      { label: "GET /v1/connect/:platform", desc: "Initiate OAuth flow for any supported platform" },
      { label: "GET /v1/accounts", desc: "List all connected accounts and their status" },
      { label: "DELETE /v1/accounts/:id", desc: "Disconnect a platform and revoke tokens" },
    ],
  },
  {
    title: "Analytics",
    links: [
      { label: "GET /v1/analytics", desc: "Unified metrics: impressions, engagements, clicks, followers" },
      { label: "GET /v1/analytics/:platform", desc: "Per-platform analytics breakdown" },
      { label: "GET /v1/analytics/export", desc: "Export analytics as CSV or JSON" },
    ],
  },
  {
    title: "Inbox",
    links: [
      { label: "GET /v1/inbox/conversations", desc: "DMs, comments, and mentions across platforms" },
      { label: "POST /v1/inbox/reply", desc: "Reply to a message or comment" },
    ],
  },
  {
    title: "Ads",
    links: [
      { label: "POST /v1/ads/boost", desc: "Boost an organic post to a paid ad" },
      { label: "GET /v1/ads/campaigns", desc: "List active ad campaigns" },
      { label: "PATCH /v1/ads/campaigns/:id", desc: "Update budget, targeting, or status" },
    ],
  },
];

export default function Docs() {
  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <MarketingNav />

      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Documentation</h1>
        <p className="mt-4 text-lg text-zinc-400">
          Everything you need to integrate baliyoban into your product.
        </p>

        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-sm text-amber-300/90">
          The public API and API keys are <strong>in development</strong> — the
          endpoints below preview the planned surface. Today, posting and the
          unified inbox are available in the{" "}
          <Link href="/sign-up" className="underline">dashboard</Link>; sign up
          to get early access to the API when it launches.
        </div>

        {/* Base URL */}
        <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#1a1a1a] px-5 py-4 font-mono text-sm">
          <span className="text-zinc-500">Base URL:</span>{" "}
          <span className="text-zinc-200">https://api.baliyoban.com/v1</span>
          <span className="ml-2 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400/90">coming soon</span>
        </div>

        <div className="mt-12 space-y-12">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-zinc-100">{section.title}</h2>
              <div className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <div
                    key={link.label}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                  >
                    <p className="font-mono text-sm font-medium text-zinc-200">{link.label}</p>
                    <p className="mt-1 text-sm text-zinc-500">{link.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
          <p className="text-sm text-zinc-400">
            Full API reference coming soon. Questions?{" "}
            <a href="mailto:subodhmaharjan3@gmail.com" className="text-indigo-400 hover:underline">
              Contact us
            </a>
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/sign-up"
            className="rounded-lg bg-[#EB3514] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Start for Free
          </Link>
        </div>
      </div>
    </main>
  );
}
