import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Customers — baliyoban",
  description: "See how teams use baliyoban to ship social media features faster.",
};

const USE_CASES = [
  {
    type: "SaaS Products",
    desc: "Embed social publishing, analytics, and inbox features directly into your product. White-label ready.",
    example: "A CRM platform added cross-platform social posting for their 5,000+ customers in under a week.",
  },
  {
    type: "Marketing Agencies",
    desc: "Manage dozens of client accounts from one dashboard. Schedule, post, and report without switching tabs.",
    example: "An agency managing 200+ client accounts cut their social media workflow time by 80%.",
  },
  {
    type: "AI-First Companies",
    desc: "Give your AI agent the ability to manage social media via MCP. No custom integrations needed.",
    example: "An AI startup integrated social posting into their agent in 30 minutes using the MCP server.",
  },
  {
    type: "E-Commerce",
    desc: "Automate product announcements, sale promotions, and customer engagement across every social channel.",
    example: "An e-commerce brand automated new product posts to 8 platforms, saving 15 hours per week.",
  },
  {
    type: "Media & Publishing",
    desc: "Distribute content across all social platforms simultaneously. Track engagement in real time.",
    example: "A digital publisher syndicates articles to 12 social platforms instantly with one API call.",
  },
  {
    type: "Developer Tools",
    desc: "Build social features into your developer platform. API-first design fits any stack.",
    example: "A no-code platform added social scheduling to their builder using baliyoban's REST API.",
  },
];

export default function Customers() {
  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <MarketingNav />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Customers</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Teams of every size use baliyoban to ship social media features faster.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc) => (
            <div key={uc.type} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-lg font-semibold text-zinc-100">{uc.type}</h3>
              <p className="mt-2 text-sm text-zinc-400">{uc.desc}</p>
              <p className="mt-4 rounded-lg bg-white/[0.03] px-3 py-2 text-xs italic text-zinc-500">
                &ldquo;{uc.example}&rdquo;
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/sign-up"
            className="inline-block rounded-lg bg-[#EB3514] px-8 py-3.5 text-lg font-semibold text-white transition-opacity hover:opacity-90"
          >
            Join Them — Start for Free
          </Link>
        </div>
      </div>
    </main>
  );
}
