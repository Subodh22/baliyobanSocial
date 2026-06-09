import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "About — baliyoban",
  description: "The story behind baliyoban and our mission to simplify social media for developers.",
};

export default function About() {
  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <MarketingNav />

      <div className="mx-auto max-w-3xl px-6 py-20 space-y-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About baliyoban</h1>
          <p className="mt-4 text-lg text-zinc-400">
            One API to rule all social media platforms.
          </p>
        </div>

        <section className="space-y-4 text-[15px] leading-relaxed text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-100">Our Mission</h2>
          <p>
            Integrating with social media APIs is painful. Each platform has its own
            authentication flow, rate limits, content format requirements, and
            breaking changes. Building and maintaining these integrations takes
            months of engineering time.
          </p>
          <p>
            baliyoban exists to solve this. We provide a single, unified API that
            handles all the complexity — so you can ship social features in minutes
            instead of months.
          </p>
        </section>

        <section className="space-y-4 text-[15px] leading-relaxed text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-100">What We Do</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-indigo-400">&#10003;</span>
              <span>Unified publishing to 15 social platforms with one API call</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-indigo-400">&#10003;</span>
              <span>Handle all OAuth flows, developer app management, and API approvals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-indigo-400">&#10003;</span>
              <span>Provide analytics, inbox, and ad management across every platform</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-indigo-400">&#10003;</span>
              <span>Ship an MCP server so AI agents can manage social media via natural language</span>
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-[15px] leading-relaxed text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-100">Built With</h2>
          <div className="flex flex-wrap gap-2">
            {["Next.js", "TypeScript", "Prisma", "Turso", "Clerk", "Tailwind CSS", "Vercel"].map((tech) => (
              <span key={tech} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4 text-[15px] leading-relaxed text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-100">Contact</h2>
          <p>
            Questions, partnerships, or just want to say hello? Reach out at{" "}
            <a href="mailto:subodhmaharjan3@gmail.com" className="text-indigo-400 hover:underline">
              subodhmaharjan3@gmail.com
            </a>
          </p>
        </section>

        <div className="pt-4">
          <Link
            href="/sign-up"
            className="inline-block rounded-lg bg-[#EB3514] px-8 py-3.5 text-lg font-semibold text-white transition-opacity hover:opacity-90"
          >
            Start for Free
          </Link>
        </div>
      </div>
    </main>
  );
}
