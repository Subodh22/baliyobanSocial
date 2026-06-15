import type { Metadata } from "next";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Roadmap — baliyoban",
  description: "See what's coming next for baliyoban.",
};

const PHASES = [
  {
    status: "Shipped",
    color: "bg-emerald-400",
    items: [
      { title: "Multi-platform posting", desc: "Publish to Twitter/X, Facebook, Instagram, LinkedIn, TikTok, YouTube" },
      { title: "OAuth account connections", desc: "One-click platform linking via official OAuth flows" },
      { title: "Dashboard & composer", desc: "Web UI for managing connections and creating posts" },
      { title: "Authentication", desc: "Clerk-based auth with Google SSO" },
    ],
  },
  {
    status: "In Progress",
    color: "bg-amber-400",
    items: [
      { title: "REST API & API keys", desc: "Public API for programmatic access to all features" },
      { title: "Scheduling", desc: "Schedule posts for future delivery with timezone support" },
      { title: "Analytics dashboard", desc: "Per-platform engagement, reach, and follower metrics" },
    ],
  },
  {
    status: "Planned",
    color: "bg-zinc-500",
    items: [
      { title: "Unified inbox", desc: "DMs, comments, and mentions in one place" },
      { title: "Webhook notifications", desc: "Real-time delivery events for posts and engagement" },
      { title: "Ad campaign management", desc: "Boost posts across Meta, Google, LinkedIn, TikTok, Pinterest, X" },
      { title: "MCP server", desc: "280+ tools for AI agents via Model Context Protocol" },
      { title: "Team collaboration", desc: "Multi-user access with roles and permissions" },
      { title: "Additional platforms", desc: "Threads, Reddit, Pinterest, Bluesky, Telegram, Snapchat, Google Business, Discord, WhatsApp" },
      { title: "White-label support", desc: "Fully brandable for agencies and SaaS products" },
      { title: "Enterprise tier", desc: "Unlimited accounts, SLA, dedicated support, and custom integrations" },
    ],
  },
];

export default function Roadmap() {
  return (
    <main className="text-[#0A0A0A]">
      <MarketingNav />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Roadmap</h1>
        <p className="mt-4 text-lg text-[#5A5A5A]">
          Where we are and where we&apos;re headed. Updated regularly.
        </p>

        <div className="mt-12 space-y-12">
          {PHASES.map((phase) => (
            <div key={phase.status}>
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${phase.color}`} />
                <h2 className="text-xl font-bold text-[#0A0A0A]">{phase.status}</h2>
              </div>
              <div className="mt-4 space-y-3 pl-5 border-l border-[#E8E8E8]">
                {phase.items.map((item) => (
                  <div key={item.title} className="rounded-xl border border-[#E8E8E8] bg-[#F6F6F6] p-4 ml-4">
                    <h3 className="font-semibold text-[#0A0A0A]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#969696]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
