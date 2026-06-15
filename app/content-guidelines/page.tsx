import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Content Guidelines — baliyoban",
  description: "What you can and cannot publish through baliyoban.",
};

export default function ContentGuidelines() {
  return (
    <main className="text-[#0A0A0A]">
      <MarketingNav />

      <div className="mx-auto max-w-3xl px-6 py-16 space-y-10">
        <div className="space-y-3 border-b border-[#E8E8E8] pb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Content Guidelines</h1>
          <p className="text-sm text-[#969696]">Last updated: June 8, 2026</p>
        </div>

        <Section title="Overview">
          <p>
            baliyoban is a tool for publishing your content to social media
            platforms. You are responsible for the content you publish. These
            guidelines outline what is and isn&apos;t allowed.
          </p>
        </Section>

        <Section title="Allowed Content">
          <ul className="list-disc pl-5 space-y-2">
            <li>Original content you have the right to publish</li>
            <li>Marketing and promotional material for your business</li>
            <li>News, commentary, and educational content</li>
            <li>Product announcements and updates</li>
            <li>Creative works (art, photography, video) that you own or have permission to share</li>
          </ul>
        </Section>

        <Section title="Prohibited Content">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Spam</strong> — bulk, automated, or repetitive content designed to manipulate engagement</li>
            <li><strong>Harassment</strong> — targeted abuse, threats, or intimidation of individuals</li>
            <li><strong>Hate speech</strong> — content that promotes violence or discrimination based on protected characteristics</li>
            <li><strong>Illegal content</strong> — anything that violates applicable laws</li>
            <li><strong>Malware &amp; phishing</strong> — links or content designed to harm or deceive</li>
            <li><strong>Impersonation</strong> — pretending to be another person or organization</li>
            <li><strong>Copyright infringement</strong> — content you don&apos;t have the right to publish</li>
          </ul>
        </Section>

        <Section title="Platform Rules">
          <p>
            In addition to these guidelines, all content must comply with the
            terms and policies of each platform you post to. Each platform has its
            own content rules, and baliyoban does not override them. Violations may
            result in platform-level actions (post removal, account suspension)
            that are outside our control.
          </p>
        </Section>

        <Section title="Enforcement">
          <p>
            Accounts that violate these guidelines may be warned, suspended, or
            terminated. If you believe content was flagged in error, contact{" "}
            <a href="mailto:subodhmaharjan3@gmail.com" className="text-[#0A0A0A] hover:underline">
              subodhmaharjan3@gmail.com
            </a>.
          </p>
        </Section>

        <div className="pt-4 flex gap-4 text-sm">
          <Link href="/terms" className="text-[#0A0A0A] hover:underline">Terms of Service</Link>
          <Link href="/privacy" className="text-[#0A0A0A] hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 text-[#5A5A5A] leading-relaxed text-[15px]">
      <h2 className="text-xl font-semibold text-[#0A0A0A]">{title}</h2>
      {children}
    </section>
  );
}
