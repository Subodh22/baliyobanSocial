import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — baliyoban",
  description: "The terms governing your use of baliyoban.",
};

const CONTACT_EMAIL = "subodhmaharjan3@gmail.com";
const LAST_UPDATED = "June 15, 2026";

export default function TermsOfService() {
  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            baliyoban
          </Link>
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="text-white">Terms</Link>
            <Link href="/data-deletion" className="hover:text-white">Data Deletion</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16 space-y-10">
        <div className="space-y-3 border-b border-white/10 pb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>
        </div>

        <Section title="1. Acceptance">
          <p>
            By using baliyoban (the &ldquo;Service&rdquo;) you agree to these
            Terms. If you do not agree, do not use the Service.
          </p>
        </Section>

        <Section title="2. What the Service does">
          <p>
            baliyoban lets you connect your own social media accounts and publish
            content to them from one place. You are responsible for the accounts
            you connect and the content you publish.
          </p>
        </Section>

        <Section title="3. Eligibility">
          <p>
            You must be at least 13 years old to use the Service. If you are
            under 18, you may only use the Service with the involvement of a
            parent or legal guardian. By using the Service, you represent that
            you meet these age requirements.
          </p>
        </Section>

        <Section title="4. User content ownership">
          <p>
            You retain full ownership of any content you create or publish
            through the Service. By using baliyoban, you grant us a limited,
            non-exclusive license to transmit your content to the platforms you
            select solely to perform the publishing actions you request. We
            claim no intellectual property rights over your content.
          </p>
        </Section>

        <Section title="5. Your responsibilities">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              You must own or be authorized to use every account you connect.
            </li>
            <li>
              You must comply with the terms and policies of each platform you
              post to (Twitter/X, Meta, LinkedIn, TikTok, Google/YouTube).
            </li>
            <li>
              You must not use the Service to publish unlawful, infringing,
              spam, or abusive content.
            </li>
          </ul>
        </Section>

        <Section title="6. Account access &amp; tokens">
          <p>
            You grant baliyoban permission to act on your behalf on connected
            platforms solely to perform the actions you request. You can revoke
            this access at any time by disconnecting an account or deleting your
            data.
          </p>
        </Section>

        <Section title="7. Availability &amp; disclaimer">
          <p>
            The Service is provided &ldquo;as is&rdquo; without warranties of any
            kind. We do not guarantee that a post will succeed on every platform,
            as publishing depends on third-party APIs outside our control. We are
            not liable for any indirect or consequential damages arising from use
            of the Service.
          </p>
        </Section>

        <Section title="8. Termination">
          <p>
            You may stop using the Service and delete your data at any time via
            the{" "}
            <Link href="/data-deletion" className="text-indigo-400 hover:underline">
              Data Deletion
            </Link>{" "}
            page. We may suspend access for violations of these Terms.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions about these Terms? Email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 text-zinc-300 leading-relaxed text-[15px]">
      <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
      {children}
    </section>
  );
}
