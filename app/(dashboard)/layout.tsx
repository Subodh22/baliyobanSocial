import { UserButton } from "@clerk/nextjs";
import { getDashboardProps } from "@/app/components/dashboard-page";
import { SidebarNav } from "@/app/components/sidebar-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { name, email } = await getDashboardProps();

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
        <SidebarNav />
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
