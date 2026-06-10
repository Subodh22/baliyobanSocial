"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 px-3 pt-2">
      {NAV.map((item) => {
        const isActive = pathname === item.href;
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
  );
}
