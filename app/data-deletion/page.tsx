import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Deletion — baliyoban",
  description: "How to delete your baliyoban account and all associated data.",
};

const CONTACT_EMAIL = "subodhmaharjan3@gmail.com";

export default async function DataDeletion({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            baliyoban
          </Link>
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/data-deletion" className="text-white">Data Deletion</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16 space-y-10">
        <div className="space-y-3 border-b border-white/10 pb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Data Deletion</h1>
          <p className="text-sm text-zinc-500">
            Delete your account and all associated data at any time.
          </p>
        </div>

        {code && (
          <div className="rounded-xl border border-green-800 bg-green-950/40 p-5 text-[15px] text-green-300">
            <p className="font-medium">Your deletion request was received.</p>
            <p className="mt-1 text-green-400/80">
              Confirmation code: <span className="font-mono">{code}</span>
            </p>
            <p className="mt-1 text-green-400/80">
              Your account and all associated data have been removed.
            </p>
          </div>
        )}

        <section className="space-y-3 text-zinc-300 leading-relaxed text-[15px]">
          <p>
            You can delete your baliyoban account and all data we hold about you —
            including connected-account tokens, profile information, and your post
            history — at any time.
          </p>
        </section>

        <section className="space-y-3 text-zinc-300 leading-relaxed text-[15px]">
          <h2 className="text-xl font-semibold text-zinc-100">
            How to request deletion
          </h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>From Facebook/Instagram:</strong> Go to your account&rsquo;s
              <em> Settings &amp; privacy → Settings → Apps and Websites</em>,
              remove &ldquo;baliyoban&rdquo;, and choose to delete your data. We
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
      </div>
    </main>
  );
}
