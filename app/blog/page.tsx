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
    <main className="text-[#0A0A0A]">
      <MarketingNav />

      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
        <p className="mt-4 text-lg text-[#5A5A5A]">News, guides, and updates from the baliyoban team</p>

        <div className="mt-12 space-y-6">
          {POSTS.map((post) => (
            <article
              key={post.title}
              className="group rounded-2xl border border-[#E8E8E8] bg-[#F6F6F6] p-6 transition-colors hover:border-[#E8E8E8] hover:bg-[#F6F6F6]"
            >
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-[#0A0A0A]/10 px-2.5 py-0.5 font-medium text-[#0A0A0A]">
                  {post.tag}
                </span>
                <span className="text-[#969696]">{post.date}</span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-[#0A0A0A] group-hover:text-[#0A0A0A]">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5A5A5A]">{post.excerpt}</p>
              <Link href="#" className="mt-4 inline-block text-sm font-medium text-[#0A0A0A] hover:underline">
                Read more &rarr;
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
