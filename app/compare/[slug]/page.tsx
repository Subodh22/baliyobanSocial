import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingNav } from "@/app/components/marketing-nav";

interface Competitor {
  name: string;
  tagline: string;
  rows: { feature: string; us: string; them: string }[];
}

const COMPETITORS: Record<string, Competitor> = {
  buffer: {
    name: "Buffer",
    tagline: "Buffer is a social scheduling tool for marketers. baliyoban is an API-first platform for developers and AI agents.",
    rows: [
      { feature: "API-first design", us: "Yes", them: "Limited API" },
      { feature: "MCP server for AI agents", us: "Yes", them: "No" },
      { feature: "Platforms supported", us: "15", them: "8" },
      { feature: "No developer app setup", us: "Yes", them: "N/A (no API focus)" },
      { feature: "White-label ready", us: "Coming soon", them: "No" },
      { feature: "Unified inbox", us: "Yes", them: "No" },
      { feature: "Free tier", us: "2 accounts free", them: "3 channels free" },
      { feature: "Ad campaign management", us: "Coming soon", them: "No" },
    ],
  },
  ayrshare: {
    name: "Ayrshare",
    tagline: "Ayrshare offers a social media API. baliyoban goes further with a dashboard, unified inbox, MCP server, and ad management.",
    rows: [
      { feature: "Dashboard included", us: "Yes", them: "API only" },
      { feature: "Unified inbox", us: "Yes", them: "No" },
      { feature: "MCP server for AI agents", us: "Yes", them: "No" },
      { feature: "Platforms supported", us: "15", them: "10" },
      { feature: "No developer app setup", us: "Yes", them: "Requires setup" },
      { feature: "Post scheduling", us: "Yes", them: "Yes" },
      { feature: "Ad campaign management", us: "Coming soon", them: "No" },
      { feature: "Free tier", us: "2 accounts free", them: "Limited free" },
    ],
  },
  blotato: {
    name: "Blotato",
    tagline: "Blotato is a social media scheduler. baliyoban is a full social media infrastructure with API, inbox, analytics, and AI agent support.",
    rows: [
      { feature: "API access", us: "Full REST API", them: "No API" },
      { feature: "MCP server for AI agents", us: "Yes", them: "No" },
      { feature: "Platforms supported", us: "15", them: "6" },
      { feature: "Unified inbox", us: "Yes", them: "No" },
      { feature: "Analytics dashboard", us: "Yes", them: "Basic" },
      { feature: "Post scheduling", us: "Yes", them: "Yes" },
      { feature: "White-label ready", us: "Coming soon", them: "No" },
      { feature: "Free tier", us: "2 accounts free", them: "Free plan available" },
    ],
  },
  publer: {
    name: "Publer",
    tagline: "Publer is a social media scheduling and analytics tool. baliyoban adds a full API, MCP server, and unified inbox on top.",
    rows: [
      { feature: "API-first design", us: "Yes", them: "Limited API" },
      { feature: "MCP server for AI agents", us: "Yes", them: "No" },
      { feature: "Platforms supported", us: "15", them: "9" },
      { feature: "Unified inbox", us: "Yes", them: "No" },
      { feature: "No developer app setup", us: "Yes", them: "N/A" },
      { feature: "Post scheduling", us: "Yes", them: "Yes" },
      { feature: "Analytics", us: "Yes", them: "Yes" },
      { feature: "Free tier", us: "2 accounts free", them: "3 accounts free" },
    ],
  },
  postiz: {
    name: "Postiz",
    tagline: "Postiz is an open-source social media scheduler. baliyoban is a managed platform with API, inbox, AI agents, and no infrastructure to run.",
    rows: [
      { feature: "Managed platform", us: "Yes", them: "Self-hosted" },
      { feature: "API access", us: "Full REST API", them: "No public API" },
      { feature: "MCP server for AI agents", us: "Yes", them: "No" },
      { feature: "Unified inbox", us: "Yes", them: "No" },
      { feature: "Platforms supported", us: "15", them: "8" },
      { feature: "Post scheduling", us: "Yes", them: "Yes" },
      { feature: "No server management", us: "Yes", them: "Requires hosting" },
      { feature: "Free tier", us: "2 accounts free", them: "Free (self-hosted)" },
    ],
  },
  unipile: {
    name: "Unipile",
    tagline: "Unipile focuses on messaging and LinkedIn APIs. baliyoban covers 15 platforms with publishing, inbox, analytics, and AI agents.",
    rows: [
      { feature: "Multi-platform publishing", us: "15 platforms", them: "LinkedIn focus" },
      { feature: "MCP server for AI agents", us: "Yes", them: "No" },
      { feature: "Dashboard included", us: "Yes", them: "API only" },
      { feature: "Unified inbox", us: "Yes", them: "Yes (messaging focus)" },
      { feature: "Post scheduling", us: "Yes", them: "Limited" },
      { feature: "Analytics", us: "Yes", them: "No" },
      { feature: "Ad campaign management", us: "Coming soon", them: "No" },
      { feature: "Free tier", us: "2 accounts free", them: "Paid only" },
    ],
  },
};

const SLUGS = Object.keys(COMPETITORS);

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = COMPETITORS[slug];
  if (!c) return {};
  return {
    title: `baliyoban vs ${c.name} — Comparison`,
    description: c.tagline,
  };
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COMPETITORS[slug];
  if (!c) notFound();

  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <MarketingNav />

      <div className="mx-auto max-w-4xl px-6 py-20 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            baliyoban vs {c.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">{c.tagline}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="py-3 pr-4 font-medium text-zinc-400">Feature</th>
                <th className="py-3 px-4 font-medium text-zinc-100">baliyoban</th>
                <th className="py-3 pl-4 font-medium text-zinc-400">{c.name}</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row) => (
                <tr key={row.feature} className="border-b border-white/[0.06]">
                  <td className="py-3.5 pr-4 text-zinc-300">{row.feature}</td>
                  <td className="py-3.5 px-4 font-medium text-emerald-400">{row.us}</td>
                  <td className="py-3.5 pl-4 text-zinc-500">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center space-y-4">
          <Link
            href="/sign-up"
            className="inline-block rounded-lg bg-[#EB3514] px-8 py-3.5 text-lg font-semibold text-white transition-opacity hover:opacity-90"
          >
            Try baliyoban for Free
          </Link>
          <p className="text-sm text-zinc-500">No credit card required. Free up to 2 accounts.</p>
        </div>
      </div>
    </main>
  );
}
