import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const NAV = [
  { label: "Connections", href: "/dashboard" },
  { label: "Posts", href: "/compose" },
  { label: "Analytics", href: "/analytics" },
  { label: "Inbox", href: "/inbox" },
  { label: "Users", href: "/users" },
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
      <aside className="hidden md:flex w-[230px] shrink-0 flex-col border-r border-[#E8E8E8] bg-white">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <UserButton />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#0A0A0A]">{name}</p>
              <p className="truncate text-xs text-[#969696]">{email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-px px-5 pt-2">
          {NAV.map((item) => {
            const isActive = item.label === active;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-[11px] rounded-[5px] px-2 py-2 text-[13.5px] transition-colors ${
                  isActive
                    ? "text-[#0A0A0A] font-medium"
                    : "text-[#5A5A5A] font-[450] hover:bg-[#F6F6F6] hover:text-[#0A0A0A]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[#E8E8E8] p-4">
          <p className="text-[11px] text-[#C2C2C2]">baliyoban v0.1</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex justify-center px-10 py-16">
        <div className="w-full max-w-[680px]">
          {children}
        </div>
      </main>
    </div>
  );
}
