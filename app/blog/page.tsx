import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Blog — baliyoban",
  description: "News, guides, and updates from the baliyoban team.",
};

const POSTS = [
  {
    title: "Introducing baliyoban: One API for 15 Social Platforms",
    excerpt: "We built baliyoban because integrating with social media APIs is broken. Each platform has its own auth flow, rate limits, content formats, and quirks. We fixed that.",
    date: "June 10, 2026",
    tag: "Announcement",
  },
  {
    title: "Why We Built an MCP Server for Social Media",
    excerpt: "AI agents are the next frontier of automation. With our MCP server, Claude Desktop and Cursor can post, schedule, and analyze your social media — no code required.",
    date: "June 10, 2026",
    tag: "Product",
  },
  {
    title: "How to Post to 15 Platforms in Under 5 Minutes",
    excerpt: "A step-by-step guide to signing up, connecting your accounts, and publishing your first cross-platform post with the baliyoban API.",
    date: "June 10, 2026",
    tag: "Tutorial",
  },
];

export default function Blog() {
  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <MarketingNav />

      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
        <p className="mt-4 text-lg text-zinc-400">News, guides, and updates from the baliyoban team</p>

        <div className="mt-12 space-y-6">
          {POSTS.map((post) => (
            <article
              key={post.title}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 font-medium text-indigo-400">
                  {post.tag}
                </span>
                <span className="text-zinc-600">{post.date}</span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-zinc-100 group-hover:text-white">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{post.excerpt}</p>
              <Link href="#" className="mt-4 inline-block text-sm font-medium text-indigo-400 hover:underline">
                Read more &rarr;
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
