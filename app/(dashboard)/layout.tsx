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
      <aside className="hidden md:flex w-[230px] shrink-0 flex-col border-r border-[#E8E8E8] bg-white sticky top-0 h-screen">
        <div className="px-5 pt-[30px] pb-2">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <UserButton />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#0A0A0A]">{name}</p>
              <p className="truncate text-xs text-[#969696]">{email}</p>
            </div>
          </div>
        </div>
        <SidebarNav />
        <div className="space-y-3 border-t border-[#E8E8E8] p-4 mt-auto">
          <SignOutButton>
            <button className="flex w-full items-center gap-[11px] rounded-[5px] px-2 py-2 text-[13.5px] text-[#969696] font-[450] transition-colors hover:bg-[#F6F6F6] hover:text-[#0A0A0A]">
              <svg className="h-4 w-4 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Log out
            </button>
          </SignOutButton>
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
