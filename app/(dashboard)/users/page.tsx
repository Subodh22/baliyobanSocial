import { getDashboardProps } from "@/app/components/dashboard-page";

export default async function Users() {
  const { name, email } = await getDashboardProps();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Users</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage team members and their access to your profiles</p>
        </div>
        <button
          disabled
          className="cursor-not-allowed rounded-lg bg-indigo-600/40 px-4 py-2 text-sm font-semibold text-indigo-300/60"
        >
          + Invite User
        </button>
      </div>

      {/* Roles overview */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { role: "Owner", desc: "Full access to all settings, billing, and team management", count: 1 },
          { role: "Admin", desc: "Manage connections, post, and view analytics", count: 0 },
          { role: "Member", desc: "Create and schedule posts, view analytics", count: 0 },
        ].map((r) => (
          <div key={r.role} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-200">{r.role}</p>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-zinc-400">{r.count}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Profiles</th>
              <th className="px-5 py-3 font-medium">Last Active</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            <tr className="text-zinc-400">
              <td className="px-5 py-4">
                <div>
                  <p className="font-medium text-zinc-200">{name}</p>
                  <p className="text-xs text-zinc-500">{email}</p>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400">Owner</span>
              </td>
              <td className="px-5 py-4 text-zinc-500">All</td>
              <td className="px-5 py-4 text-zinc-500">Now</td>
              <td className="px-5 py-4 text-zinc-600 text-right">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
