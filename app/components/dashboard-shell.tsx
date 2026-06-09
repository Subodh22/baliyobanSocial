import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const NAV = [
  { label: "Connections", href: "/dashboard" },
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

export function DashboardShell({
  active,
  name,
  email,
  children,
}: {
  active: string;
  name: string;
  email: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-[calc(100vh-1px)]">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#111]">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <UserButton />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-100">{name}</p>
              <p className="truncate text-xs text-zinc-500">{email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 pt-2">
          {NAV.map((item) => {
            const isActive = item.label === active;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-white/[0.08] font-semibold text-zinc-100"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-indigo-400" : "bg-zinc-700"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/[0.06] p-4">
          <p className="text-[11px] text-zinc-600">baliyoban v0.1</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
        {children}
      </main>
    </div>
  );
}
