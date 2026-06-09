import type { Metadata } from "next";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Changelog — baliyoban",
  description: "What's new in baliyoban. Product updates and improvements.",
};

const ENTRIES = [
  {
    date: "June 2026",
    title: "Launch",
    items: [
      "Multi-platform publishing to Twitter/X, Facebook, Instagram, LinkedIn, TikTok, and YouTube",
      "OAuth-based account connections",
      "Compose page for creating and posting from the dashboard",
      "Privacy policy, terms of service, and data deletion flows",
      "Clerk authentication with Google SSO",
      "Turso (libSQL) database with Prisma ORM",
    ],
  },
  {
    date: "Coming Soon",
    title: "Roadmap",
    items: [
      "Scheduling and queued posts",
      "Analytics dashboard with per-platform breakdowns",
      "Unified inbox for DMs and comments",
      "Ad campaign management across 6 networks",
      "MCP server with 280+ tools for AI agents",
      "Webhook notifications",
      "Team collaboration and multi-seat plans",
      "API key management and rate limiting",
    ],
  },
];

export default function Changelog() {
  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <MarketingNav />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Changelog</h1>
        <p className="mt-4 text-lg text-zinc-400">Product updates and improvements</p>

        <div className="mt-12 space-y-12">
          {ENTRIES.map((entry) => (
            <div key={entry.date} className="relative border-l-2 border-white/[0.06] pl-8">
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-indigo-500 bg-[#0a0a0a]" />
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">{entry.date}</p>
              <h2 className="mt-2 text-xl font-bold text-zinc-100">{entry.title}</h2>
              <ul className="mt-4 space-y-2">
                {entry.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="mt-1 text-zinc-600">&#8226;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
