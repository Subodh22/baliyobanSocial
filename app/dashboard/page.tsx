import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ensureUser } from "@/lib/user";
import Link from "next/link";
import NewConnectionButton from "./new-connection-button";

const PROVIDER_META: Record<string, { label: string; icon: string; color: string }> = {
  twitter:  { label: "Twitter / X", icon: "𝕏",  color: "bg-zinc-100 text-black" },
  facebook: { label: "Facebook",    icon: "f",   color: "bg-blue-600 text-white" },
  linkedin: { label: "LinkedIn",    icon: "in",  color: "bg-sky-700 text-white" },
  tiktok:   { label: "TikTok",      icon: "♪",   color: "bg-pink-600 text-white" },
  google:   { label: "YouTube",     icon: "▶",   color: "bg-red-600 text-white" },
};

const NAV = [
  { label: "Connections", href: "/dashboard", active: true },
  { label: "Posts", href: "/compose" },
  { label: "Analytics", href: "/analytics" },
  { label: "Inbox", href: "/inbox" },
  { label: "Ads", href: "/ads" },
  { label: "Numbers", href: "/numbers" },
  { label: "API Keys", href: "/api-keys" },
  { label: "Users", href: "/users" },
  { label: "Webhooks", href: "/webhooks" },
  { label: "Logs", href: "/logs" },
  { label: "Settings", href: "/settings" },
];

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  let profile: Awaited<ReturnType<typeof ensureUser>> = null;
  let accounts: { provider: string; providerAccountId: string }[] = [];
  let dbError: string | null = null;
  try {
    [profile, accounts] = await Promise.all([
      ensureUser(),
      prisma.account.findMany({
        where: { userId },
        select: { provider: true, providerAccountId: true },
      }),
    ]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }
  const name = profile?.name ?? profile?.email?.split("@")[0] ?? "Account";

  if (dbError) {
    const urlScheme = process.env.TURSO_DATABASE_URL?.split(":")[0] ?? "(unset)";
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
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
      </main>
    );
  }

  return (
    <div className="flex flex-1 min-h-[calc(100vh-1px)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#111]">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <UserButton />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-100">{name}</p>
              <p className="truncate text-xs text-zinc-500">{profile?.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 pt-2">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                item.active
                  ? "bg-white/[0.08] font-semibold text-zinc-100"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${item.active ? "bg-indigo-400" : "bg-zinc-700"}`} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] p-4">
          <p className="text-[11px] text-zinc-600">baliyoban v0.1</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
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
                    <span className="text-xs text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
                      Manage &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
