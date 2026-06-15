import { Suspense } from "react";
import { getDashboardProps } from "@/app/components/dashboard-page";

async function UsersContent() {
  const { name, email } = await getDashboardProps();

  return (
    <>
      {/* Roles overview */}
      <div className="grid grid-cols-3 border border-[#E8E8E8] rounded overflow-hidden mb-4">
        {[
          { role: "Owner", count: 1 },
          { role: "Admin", count: 0 },
          { role: "Member", count: 0 },
        ].map((r, i) => (
          <div key={r.role} className={`p-5 ${i < 2 ? "border-r border-[#E8E8E8]" : ""}`}>
            <p className={`font-[family-name:var(--font-jetbrains-mono)] text-[30px] font-medium tracking-[-0.03em] leading-none mb-2 ${r.count === 0 ? "text-[#969696]" : ""}`}>
              {r.count}
            </p>
            <p className="text-xs text-[#5A5A5A] font-[450]">{r.role}</p>
          </div>
        ))}
      </div>

      {/* Members header */}
      <div className="flex items-baseline justify-between mb-[18px] mt-10">
        <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.04em] text-[#969696]">Members</span>
        <button className="text-[13px] text-[#0A0A0A] font-[450] inline-flex items-center gap-[5px] border-b border-[#0A0A0A] transition-opacity hover:opacity-55">
          Invite
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[13px] w-[13px]">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Users table */}
      <div className="border border-[#E8E8E8] rounded overflow-hidden">
        <div className="flex gap-4 px-5 py-[11px] bg-[#F6F6F6] border-b border-[#E8E8E8] font-[family-name:var(--font-jetbrains-mono)] text-[10.5px] font-medium text-[#969696] uppercase tracking-[0.04em]">
          <div className="flex-[2] min-w-0">User</div>
          <div className="flex-1 min-w-0">Role</div>
          <div className="flex-1 min-w-0">Profiles</div>
          <div className="flex-1 min-w-0">Active</div>
        </div>
        <div className="flex gap-4 px-5 py-[15px] items-center">
          <div className="flex-[2] min-w-0 flex items-center gap-3">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#0A0A0A] text-white text-xs font-semibold shrink-0">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-[#0A0A0A]">{name}</p>
              <p className="text-xs text-[#969696] font-[family-name:var(--font-jetbrains-mono)]">{email}</p>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10.5px] font-medium text-[#0A0A0A] bg-[#F4F4F4] border border-[#DEDEDE] px-2 py-[2px] rounded-[3px] uppercase tracking-[0.03em]">Owner</span>
          </div>
          <div className="flex-1 min-w-0 text-sm text-[#5A5A5A]">All</div>
          <div className="flex-1 min-w-0 font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#969696]">Now</div>
        </div>
      </div>

      <p className="mt-[18px] text-[13px] text-[#969696] text-center font-[family-name:var(--font-jetbrains-mono)]">
        Team seats arrive with the Pro plan.
      </p>
    </>
  );
}

function UsersSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-3 border border-[#E8E8E8] rounded overflow-hidden mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`p-5 ${i < 3 ? "border-r border-[#E8E8E8]" : ""}`}>
            <div className="h-8 w-8 rounded bg-[#E8E8E8] mb-2" />
            <div className="h-3 w-12 rounded bg-[#F4F4F4]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Users() {
  return (
    <>
      <div className="mb-11">
        <h1 className="font-[family-name:var(--font-jetbrains-mono)] text-[21px] font-medium tracking-[-0.02em]">Users</h1>
        <p className="mt-1.5 text-sm text-[#5A5A5A]">Team members and their access to your profiles.</p>
      </div>

      <Suspense fallback={<UsersSkeleton />}>
        <UsersContent />
      </Suspense>
    </>
  );
}
