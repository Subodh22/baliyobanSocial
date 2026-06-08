import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Deletion — SocialHub",
  description: "How to delete your SocialHub account and all associated data.",
};

const CONTACT_EMAIL = "subodhmaharjan3@gmail.com";

export default async function DataDeletion({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold">Data Deletion</h1>
      </div>

      {code && (
        <div className="rounded-xl border border-green-800 bg-green-950/40 p-4 text-sm text-green-300">
          <p className="font-medium">Your deletion request was received.</p>
          <p className="mt-1 text-green-400/80">
            Confirmation code: <span className="font-mono">{code}</span>
          </p>
          <p className="mt-1 text-green-400/80">
            Your account and all associated data have been removed.
          </p>
        </div>
      )}

      <section className="space-y-3 text-zinc-300 leading-relaxed text-sm">
        <p>
          You can delete your SocialHub account and all data we hold about you —
          including connected-account tokens, profile information, and your post
          history — at any time.
        </p>
      </section>

      <section className="space-y-3 text-zinc-300 leading-relaxed text-sm">
        <h2 className="text-lg font-semibold text-zinc-100">
          How to request deletion
        </h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>From Facebook/Instagram:</strong> Go to your account&rsquo;s
            <em> Settings &amp; privacy → Settings → Apps and Websites</em>,
            remove &ldquo;SocialHub&rdquo;, and choose to delete your data. We
            receive the request automatically and erase your data.
          </li>
          <li>
            <strong>By email:</strong> Send a request to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">
              {CONTACT_EMAIL}
            </a>{" "}
            from the email address on your account. We complete deletions within
            30 days.
          </li>
        </ol>
        <p>
          Removing a connected platform on your{" "}
          <Link href="/dashboard" className="text-indigo-400 hover:underline">
            dashboard
          </Link>{" "}
          revokes that platform&rsquo;s tokens immediately.
        </p>
      </section>
    </main>
  );
}
