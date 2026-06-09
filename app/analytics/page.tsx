import { DashboardShell } from "@/app/components/dashboard-shell";
import { getDashboardProps } from "@/app/components/dashboard-page";

export default async function Analytics() {
  const { name, email } = await getDashboardProps();

  return (
    <DashboardShell active="Analytics" name={name} email={email}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Analytics</h1>
          <p className="mt-1 text-sm text-zinc-500">Track engagement, reach, and growth across all platforms</p>
        </div>
      </div>

      {/* Overview cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Impressions", value: "—", change: null },
          { label: "Engagements", value: "—", change: null },
          { label: "Link Clicks", value: "—", change: null },
          { label: "Followers Gained", value: "—", change: null },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-zinc-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Per-platform breakdown */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-200">Platform Breakdown</h2>
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-3 font-medium">Platform</th>
                <th className="px-5 py-3 font-medium">Posts</th>
                <th className="px-5 py-3 font-medium">Impressions</th>
                <th className="px-5 py-3 font-medium">Engagements</th>
                <th className="px-5 py-3 font-medium">Eng. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {["Twitter / X", "Facebook", "Instagram", "LinkedIn", "TikTok", "YouTube"].map((p) => (
                <tr key={p} className="text-zinc-400">
                  <td className="px-5 py-3 font-medium text-zinc-200">{p}</td>
                  <td className="px-5 py-3">—</td>
                  <td className="px-5 py-3">—</td>
                  <td className="px-5 py-3">—</td>
                  <td className="px-5 py-3">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-zinc-600">Analytics data will appear here once you connect accounts and start posting.</p>
      </div>
    </DashboardShell>
  );
}
