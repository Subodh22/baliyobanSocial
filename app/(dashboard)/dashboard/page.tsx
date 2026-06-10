import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import NewConnectionButton from "./new-connection-button";
import ConnectionActions from "./connection-actions";

const PROVIDER_META: Record<string, { label: string; icon: string; color: string }> = {
  twitter:  { label: "Twitter / X", icon: "𝕏",  color: "bg-zinc-100 text-black" },
  facebook: { label: "Facebook",    icon: "f",   color: "bg-blue-600 text-white" },
  linkedin: { label: "LinkedIn",    icon: "in",  color: "bg-sky-700 text-white" },
  tiktok:   { label: "TikTok",      icon: "♪",   color: "bg-pink-600 text-white" },
  google:   { label: "YouTube",     icon: "▶",   color: "bg-red-600 text-white" },
};

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  let accounts: { provider: string; providerAccountId: string }[] = [];
  let dbError: string | null = null;
  try {
    accounts = await prisma.account.findMany({
      where: { userId },
      select: { provider: true, providerAccountId: true },
    });
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  if (dbError) {
    const urlScheme = process.env.TURSO_DATABASE_URL?.split(":")[0] ?? "(unset)";
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-red-500/20 bg-red-950/30 p-8">
          <h1 className="text-2xl font-bold text-red-200">Database not ready</h1>
          <p className="mt-2 text-sm text-zinc-400">
            You&rsquo;re signed in, but the dashboard couldn&rsquo;t reach the database.
          </p>
          <pre className="mt-6 overflow-x-auto rounded-lg border border-red-500/20 bg-black/40 p-4 text-xs text-red-300">
            {dbError}
          </pre>
          <ul className="mt-6 space-y-1.5 text-sm text-zinc-400">
            <li>TURSO_DATABASE_URL scheme: <code className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-200">{urlScheme}</code></li>
            <li>TURSO_AUTH_TOKEN set: <code className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-200">{String(Boolean(process.env.TURSO_AUTH_TOKEN))}</code></li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Connections</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage profiles and platform integrations</p>
        </div>
        <div className="flex items-center gap-2">
          <NewConnectionButton />
          <button
            disabled
            title="Coming soon"
            className="cursor-not-allowed rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-600"
          >
            New Profile
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-zinc-300">Platforms</span>
          <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-400">
            All profiles
            <span className="text-zinc-600">&#9662;</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-500">All platforms &#9662;</span>
          <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-500">All statuses &#9662;</span>
        </div>
      </div>

      {/* Cards */}
      {accounts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10">
            <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.338a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5a4.5 4.5 0 1 1 6.364 6.364l-1.757 1.757" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-300">No platform connections yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-500">
            You&rsquo;re signed in. Connecting social accounts for posting is
            coming soon&nbsp;&mdash; it needs each platform&rsquo;s API approval.
          </p>
          <Link
            href="/compose"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Try the composer
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc) => {
            const meta = PROVIDER_META[acc.provider] ?? { label: acc.provider, icon: "•", color: "bg-zinc-700 text-zinc-300" };
            return (
              <div
                key={acc.provider}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${meta.color}`}>
                    {meta.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{meta.label}</p>
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      connected
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-0.5 text-xs text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Default
                  </span>
                  <ConnectionActions provider={acc.provider} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
