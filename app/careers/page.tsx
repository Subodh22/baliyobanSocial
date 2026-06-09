import type { Metadata } from "next";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Careers — baliyoban",
  description: "Join the team building the unified social media API.",
};

export default function Careers() {
  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <MarketingNav />

      <div className="mx-auto max-w-3xl px-6 py-20 space-y-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Careers</h1>
          <p className="mt-4 text-lg text-zinc-400">
            Help us build the API that powers social media for developers and AI agents.
          </p>
        </div>

        <section className="space-y-4 text-[15px] leading-relaxed text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-100">Why baliyoban?</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-indigo-400">&#10003;</span>
              <span>Work on a product used by developers and AI agents worldwide</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-indigo-400">&#10003;</span>
              <span>Small team, high impact — every contribution matters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-indigo-400">&#10003;</span>
              <span>Remote-first with flexible hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-indigo-400">&#10003;</span>
              <span>Modern stack: Next.js, TypeScript, Prisma, Turso, Vercel</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-100">Open Positions</h2>
          <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-sm text-zinc-400">No open positions right now.</p>
            <p className="mt-2 text-sm text-zinc-500">
              Interested anyway? Send your resume to{" "}
              <a href="mailto:subodhmaharjan3@gmail.com" className="text-indigo-400 hover:underline">
                subodhmaharjan3@gmail.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
