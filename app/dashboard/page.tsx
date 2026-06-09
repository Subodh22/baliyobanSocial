import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ensureUser } from "@/lib/user";
import Link from "next/link";

const PROVIDER_META: Record<string, { label: string; icon: string; color: string }> = {
  twitter:  { label: "Twitter / X", icon: "𝕏",  color: "bg-zinc-100 text-black" },
  facebook: { label: "Facebook",    icon: "f",   color: "bg-blue-600 text-white" },
  linkedin: { label: "LinkedIn",    icon: "in",  color: "bg-sky-700 text-white" },
  tiktok:   { label: "TikTok",      icon: "♪",   color: "bg-pink-600 text-white" },
  google:   { label: "YouTube",     icon: "▶",   color: "bg-red-600 text-white" },
};

const SECTIONS = [
  { id: "connections", label: "Connections" },
  { id: "posts", label: "Posts" },
  { id: "analytics", label: "Analytics" },
  { id: "inbox", label: "Inbox" },
  { id: "ads", label: "Ads" },
  { id: "numbers", label: "Numbers" },
  { id: "api-keys", label: "API Keys" },
  { id: "users", label: "Users" },
  { id: "webhooks", label: "Webhooks" },
  { id: "logs", label: "Logs" },
  { id: "settings", label: "Settings" },
] as const;

const SECTION_META: Record<string, { title: string; subtitle: string; icon: string }> = {
  posts:      { title: "Posts",      subtitle: "View and manage all published posts across platforms",          icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" },
  analytics:  { title: "Analytics",  subtitle: "Track engagement, reach, and growth across all platforms",      icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" },
  inbox:      { title: "Inbox",      subtitle: "Unified inbox for DMs, comments, and mentions",                icon: "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" },
  ads:        { title: "Ads",        subtitle: "Create and manage ad campaigns across 6 ad networks",          icon: "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.75.75 0 0 1-1.021-.27 18.634 18.634 0 0 1-1.881-5.346m5.037.937a7.489 7.489 0 0 0 3.654-3.654m-3.654 3.654V21a.75.75 0 0 0 1.029.694l.657-.38c.523-.302.71-.962.463-1.511a18.66 18.66 0 0 0-.985-2.783M15.377 5.06a7.489 7.489 0 0 1 3.654 3.654m0 0h.673a.75.75 0 0 1 .693 1.029l-.38.657c-.302.523-.962.71-1.511.463a18.634 18.634 0 0 1-2.783-.985" },
  numbers:    { title: "Numbers",    subtitle: "Phone numbers and WhatsApp Business accounts",                  icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" },
  "api-keys": { title: "API Keys",   subtitle: "Manage API keys for programmatic access",                      icon: "M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" },
  users:      { title: "Users",      subtitle: "Team members and role management",                              icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" },
  webhooks:   { title: "Webhooks",   subtitle: "Configure webhook endpoints for real-time events",              icon: "M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" },
  logs:       { title: "Logs",       subtitle: "API request logs and debugging",                                icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" },
  settings:   { title: "Settings",   subtitle: "Account settings, billing, and preferences",                    icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" },
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { section: sectionParam } = await searchParams;
  const activeSection = sectionParam ?? "connections";

  let profile: Awaited<ReturnType<typeof ensureUser>> = null;
  let accounts: { provider: string; providerAccountId: string }[] = [];
  let dbError: string | null = null;
  try {
    profile = await ensureUser();
    accounts = await prisma.account.findMany({
      where: { userId },
      select: { provider: true, providerAccountId: true },
    });
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
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/10 bg-[#0d0d0d]">
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
          {SECTIONS.map((item) => (
            <Link
              key={item.id}
              href={item.id === "connections" ? "/dashboard" : `/dashboard?section=${item.id}`}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                activeSection === item.id
                  ? "bg-white/[0.08] font-semibold text-zinc-100"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${activeSection === item.id ? "bg-[#EB3514]" : "bg-zinc-700"}`} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="text-[11px] text-zinc-600">baliyoban v0.1</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a] px-6 py-8 sm:px-10">
        {activeSection === "connections" ? (
          <ConnectionsSection accounts={accounts} />
        ) : (
          <PlaceholderSection sectionId={activeSection} />
        )}
      </main>
    </div>
  );
}

function ConnectionsSection({ accounts }: { accounts: { provider: string; providerAccountId: string }[] }) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Connections</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage profiles and platform integrations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled
            title="Platform connections coming soon"
            className="cursor-not-allowed rounded-lg bg-[#EB3514]/40 px-4 py-2 text-sm font-semibold text-[#EB3514]/60"
          >
            + New Connection
          </button>
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
          <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300">
            All profiles
            <span className="text-zinc-600">&#9662;</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300">All platforms &#9662;</span>
          <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300">All statuses &#9662;</span>
        </div>
      </div>

      {/* Cards */}
      {accounts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EB3514]/10">
            <svg className="h-6 w-6 text-[#EB3514]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#EB3514] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
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
                className="group rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/15 hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${meta.color}`}>
                    {meta.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{meta.label}</p>
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
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
    </>
  );
}

function PlaceholderSection({ sectionId }: { sectionId: string }) {
  const meta = SECTION_META[sectionId];
  if (!meta) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <p className="text-sm text-zinc-500">Unknown section</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{meta.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{meta.subtitle}</p>
      </div>

      <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-zinc-300">{meta.subtitle}</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-500">
          This feature is coming soon. We&rsquo;re building it out and will notify you when it&rsquo;s ready.
        </p>
        <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-[#EB3514]" />
          Coming soon
        </span>
      </div>
    </>
  );
}
