import type { Metadata } from "next";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Careers — baliyoban",
  description: "Join the team building the unified social media API.",
};

export default function Careers() {
  return (
    <main className="text-[#0A0A0A]">
      <MarketingNav />

      <div className="mx-auto max-w-3xl px-6 py-20 space-y-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Careers</h1>
          <p className="mt-4 text-lg text-[#5A5A5A]">
            Help us build the API that powers social media for developers and AI agents.
          </p>
        </div>

        <section className="space-y-4 text-[15px] leading-relaxed text-[#5A5A5A]">
          <h2 className="text-xl font-semibold text-[#0A0A0A]">Why baliyoban?</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[#0A0A0A]">&#10003;</span>
              <span>Work on a product used by developers and AI agents worldwide</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[#0A0A0A]">&#10003;</span>
              <span>Small team, high impact — every contribution matters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[#0A0A0A]">&#10003;</span>
              <span>Remote-first with flexible hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[#0A0A0A]">&#10003;</span>
              <span>Modern stack: Next.js, TypeScript, Prisma, Turso, Vercel</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#0A0A0A]">Open Positions</h2>
          <div className="mt-4 rounded-xl border border-dashed border-[#E8E8E8] bg-[#F6F6F6] px-6 py-12 text-center">
            <p className="text-sm text-[#5A5A5A]">No open positions right now.</p>
            <p className="mt-2 text-sm text-[#969696]">
              Interested anyway? Send your resume to{" "}
              <a href="mailto:subodhmaharjan3@gmail.com" className="text-[#0A0A0A] hover:underline">
                subodhmaharjan3@gmail.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
