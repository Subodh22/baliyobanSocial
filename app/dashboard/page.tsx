import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ensureUser } from "@/lib/user";
import { migrateDatabase } from "@/lib/migrate";
import { revalidatePath } from "next/cache";
import Link from "next/link";

const PROVIDER_META: Record<string, { label: string; icon: string }> = {
  twitter:  { label: "Twitter / X", icon: "𝕏" },
  facebook: { label: "Facebook",    icon: "f" },
  linkedin: { label: "LinkedIn",    icon: "in" },
  tiktok:   { label: "TikTok",      icon: "♪" },
  google:   { label: "YouTube",     icon: "▶" },
};

const NAV = [
  { label: "Connections", href: "/dashboard", active: true },
  { label: "Posts", href: "/compose" },
  { label: "Analytics", href: "#" },
  { label: "Inbox", href: "#" },
  { label: "Ads", href: "#" },
  { label: "Numbers", href: "#" },
  { label: "API Keys", href: "#" },
  { label: "Users", href: "#" },
  { label: "Webhooks", href: "#" },
  { label: "Logs", href: "#" },
  { label: "Settings", href: "#" },
];

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/");

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
    const urlScheme = process.env.TURSO_DATABASE_URL?.split(":")[0] ?? "(unset → using local file)";
    const missingTables = /no such table/i.test(dbError);

    async function setupDatabase() {
      "use server";
      await migrateDatabase();
      revalidatePath("/dashboard");
      redirect("/dashboard");
    }

    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-bold">Database not ready</h1>
        <p className="mt-2 text-sm text-zinc-400">
          You&rsquo;re signed in, but the dashboard couldn&rsquo;t reach the database.
        </p>
        <pre className="mt-6 overflow-x-auto rounded-lg border border-white/10 bg-white/5 p-4 text-xs text-red-300">
          {dbError}
        </pre>
        <ul className="mt-6 space-y-1 text-sm text-zinc-400">
          <li>TURSO_DATABASE_URL scheme: <span className="text-zinc-200">{urlScheme}</span></li>
          <li>TURSO_AUTH_TOKEN set: <span className="text-zinc-200">{String(Boolean(process.env.TURSO_AUTH_TOKEN))}</span></li>
        </ul>

        {missingTables && (
          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-300">
              The tables don&rsquo;t exist in this database yet. Click below to
              create them in the database this deployment is connected to.
            </p>
            <form action={setupDatabase} className="mt-4">
              <button className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
                Set up database
              </button>
            </form>
          </div>
        )}
      </main>
    );
  }

  return (
    <div className="flex flex-1 min-h-[calc(100vh-1px)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/60">
        <div className="p-3">
          <div className="flex items-center gap-2 rounded-lg p-2">
            <UserButton />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-zinc-500">{profile?.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                item.active
                  ? "bg-zinc-200/70 font-semibold text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 px-6 py-6 sm:px-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Connections</h1>
            <p className="mt-1 text-sm text-zinc-500">Manage profiles and platform integrations</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled
              title="Platform connections coming soon"
              className="cursor-not-allowed rounded-lg bg-indigo-600/50 px-4 py-2 text-sm font-semibold text-white"
            >
              + New Connection
            </button>
            <button
              disabled
              title="Coming soon"
              className="cursor-not-allowed rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-400"
            >
              New Profile
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Platforms</span>
            <span className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600">
              All profiles
              <span className="text-zinc-400">▾</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-500">All platforms ▾</span>
            <span className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-500">All statuses ▾</span>
          </div>
        </div>

        {/* Cards */}
        {accounts.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-zinc-300 p-12 text-center">
            <p className="text-sm font-medium text-zinc-600">No platform connections yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-400">
              You&rsquo;re signed in. Connecting social accounts for posting is
              coming soon — it needs each platform&rsquo;s API approval.
            </p>
            <Link
              href="/compose"
              className="mt-5 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Try the composer
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((acc) => {
              const meta = PROVIDER_META[acc.provider] ?? { label: acc.provider, icon: "•" };
              return (
                <div
                  key={acc.provider}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-base">
                      {meta.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{meta.label}</p>
                      <span className="mt-0.5 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        connected
                      </span>
                    </div>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Default
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
