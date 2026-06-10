export default function Numbers() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Numbers</h1>
          <p className="mt-1 text-sm text-zinc-500">Usage stats, quotas, and account limits at a glance</p>
        </div>
        <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-500">This month &#9662;</span>
      </div>

      {/* Usage overview */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Posts Published", value: "0", limit: "100 / mo" },
          { label: "API Calls", value: "0", limit: "10,000 / mo" },
          { label: "Connected Accounts", value: "0", limit: "2 free" },
          { label: "Media Uploaded", value: "0 MB", limit: "500 MB / mo" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-zinc-100">{stat.value}</p>
            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: "0%" }} />
              </div>
              <p className="mt-1 text-xs text-zinc-600">{stat.limit}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rate limits */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-200">Platform Rate Limits</h2>
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-3 font-medium">Platform</th>
                <th className="px-5 py-3 font-medium">Posts Today</th>
                <th className="px-5 py-3 font-medium">Daily Limit</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {[
                { platform: "Twitter / X", limit: "2,400" },
                { platform: "Facebook", limit: "50" },
                { platform: "Instagram", limit: "25" },
                { platform: "LinkedIn", limit: "100" },
                { platform: "TikTok", limit: "50" },
                { platform: "YouTube", limit: "50" },
              ].map((row) => (
                <tr key={row.platform} className="text-zinc-400">
                  <td className="px-5 py-3 font-medium text-zinc-200">{row.platform}</td>
                  <td className="px-5 py-3">0</td>
                  <td className="px-5 py-3">{row.limit}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      OK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
