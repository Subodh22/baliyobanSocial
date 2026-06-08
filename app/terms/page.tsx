import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — SocialHub",
  description: "The terms governing your use of SocialHub.",
};

const CONTACT_EMAIL = "subodhmaharjan3@gmail.com";
const LAST_UPDATED = "June 8, 2026";

export default function TermsOfService() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>
      </div>

      <Section title="1. Acceptance">
        <p>
          By using SocialHub (the &ldquo;Service&rdquo;) you agree to these
          Terms. If you do not agree, do not use the Service.
        </p>
      </Section>

      <Section title="2. What the Service does">
        <p>
          SocialHub lets you connect your own social media accounts and publish
          content to them from one place. You are responsible for the accounts
          you connect and the content you publish.
        </p>
      </Section>

      <Section title="3. Your responsibilities">
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

      <Section title="4. Account access &amp; tokens">
        <p>
          You grant SocialHub permission to act on your behalf on connected
          platforms solely to perform the actions you request. You can revoke
          this access at any time by disconnecting an account or deleting your
          data.
        </p>
      </Section>

      <Section title="5. Availability &amp; disclaimer">
        <p>
          The Service is provided &ldquo;as is&rdquo; without warranties of any
          kind. We do not guarantee that a post will succeed on every platform,
          as publishing depends on third-party APIs outside our control. We are
          not liable for any indirect or consequential damages arising from use
          of the Service.
        </p>
      </Section>

      <Section title="6. Termination">
        <p>
          You may stop using the Service and delete your data at any time via
          the{" "}
          <Link href="/data-deletion" className="text-indigo-400 hover:underline">
            Data Deletion
          </Link>{" "}
          page. We may suspend access for violations of these Terms.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          Questions about these Terms? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 text-zinc-300 leading-relaxed text-sm">
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      {children}
    </section>
  );
}
