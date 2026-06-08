import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — SocialHub",
  description: "How SocialHub collects, uses, and protects your data.",
};

const CONTACT_EMAIL = "subodhmaharjan3@gmail.com";
const LAST_UPDATED = "June 8, 2026";

export default function PrivacyPolicy() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>
      </div>

      <section className="space-y-3 text-zinc-300 leading-relaxed text-sm">
        <p>
          SocialHub (&ldquo;we&rdquo;, &ldquo;us&rdquo;) lets you write a single
          message and publish it to the social media accounts you choose to
          connect. This policy explains what data we handle and why.
        </p>
      </section>

      <Section title="Information we collect">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Account &amp; profile data</strong> from the platforms you
            connect (name, email, profile image, and a platform user ID),
            provided through their official OAuth login.
          </li>
          <li>
            <strong>Access and refresh tokens</strong> for each connected
            platform. These let us publish on your behalf and are stored only to
            provide that function.
          </li>
          <li>
            <strong>Content you create</strong> — the text, media URLs, and the
            list of platforms for each post, plus the per-platform result of
            publishing it.
          </li>
        </ul>
      </Section>

      <Section title="How we use your information">
        <ul className="list-disc pl-5 space-y-2">
          <li>To authenticate you and keep you signed in.</li>
          <li>
            To publish the posts you explicitly submit to the platforms you
            select.
          </li>
          <li>To show you your connected accounts and post history.</li>
        </ul>
        <p>
          We do <strong>not</strong> sell your data, use it for advertising, or
          access your accounts for any purpose other than the actions you
          request.
        </p>
      </Section>

      <Section title="Information we share">
        <p>
          When you publish a post, its content is sent to the platforms you
          selected — Twitter/X, Meta (Facebook &amp; Instagram), LinkedIn,
          TikTok, and/or Google (YouTube) — through their official APIs, subject
          to each platform&rsquo;s own privacy policy. We do not share your data
          with any other third parties except as required by law.
        </p>
      </Section>

      <Section title="Data retention &amp; deletion">
        <p>
          We keep your data only while your account is active. You can
          disconnect a platform at any time, or request full deletion of your
          account and all associated data — see our{" "}
          <Link href="/data-deletion" className="text-indigo-400 hover:underline">
            Data Deletion
          </Link>{" "}
          page. Deletion requests are completed within 30 days.
        </p>
      </Section>

      <Section title="Security">
        <p>
          Tokens and personal data are stored in a managed database with access
          restricted to the application. No method of transmission or storage is
          100% secure, but we take reasonable measures to protect your
          information.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy or your data? Email{" "}
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
