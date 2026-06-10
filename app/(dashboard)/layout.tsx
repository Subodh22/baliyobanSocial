import { UserButton, SignOutButton } from "@clerk/nextjs";
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
        <div className="space-y-3 border-t border-white/[0.06] p-4">
          <SignOutButton>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              Log out
            </button>
          </SignOutButton>
          <p className="text-[11px] text-zinc-600">baliyoban v0.1</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
        {children}
      </main>
    </div>
  );
}
