import { auth, signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
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
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    select: { provider: true, providerAccountId: true },
  });

  const connected = new Set(accounts.map((a) => a.provider));
  const unconnected = Object.keys(PROVIDER_META).filter((p) => !connected.has(p));
  const name = session.user.name ?? session.user.email?.split("@")[0] ?? "Account";

  async function disconnect(formData: FormData) {
    "use server";
    const s = await auth();
    if (!s?.user?.id) return;
    const provider = formData.get("provider");
    if (typeof provider === "string") {
      await prisma.account.deleteMany({ where: { userId: s.user.id, provider } });
      revalidatePath("/dashboard");
    }
  }

  return (
    <div className="flex flex-1 min-h-[calc(100vh-1px)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/60">
        <div className="p-3">
          <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-zinc-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white">
              {name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-zinc-500">{session.user.email}</p>
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
        <div className="p-3">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
              Sign out
            </button>
          </form>
        </div>
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
            <NewConnection unconnected={unconnected} />
            <button className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
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
            <p className="text-sm text-zinc-500">No connections yet.</p>
            <p className="mt-1 text-sm text-zinc-400">
              Click <span className="font-medium text-zinc-600">+ New Connection</span> to link your first account.
            </p>
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
                  <div className="flex items-start justify-between">
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
                    <span className="text-zinc-300" title="Connected account">ⓘ</span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-zinc-800">{name}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Default
                  </span>

                  <form action={disconnect} className="mt-4">
                    <input type="hidden" name="provider" value={acc.provider} />
                    <button className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                      Disconnect
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// Native <details> dropdown — works without client JS. Each option is a sign-in form.
function NewConnection({ unconnected }: { unconnected: string[] }) {
  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
        + New Connection
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
        {unconnected.length === 0 ? (
          <p className="px-3 py-2 text-sm text-zinc-500">All platforms connected 🎉</p>
        ) : (
          unconnected.map((provider) => (
            <form
              key={provider}
              action={async () => {
                "use server";
                await signIn(provider, { redirectTo: "/dashboard" });
              }}
            >
              <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100">
                <span className="w-5 text-center">{PROVIDER_META[provider].icon}</span>
                {PROVIDER_META[provider].label}
              </button>
            </form>
          ))
        )}
      </div>
    </details>
  );
}
