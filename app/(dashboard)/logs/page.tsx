export default function Logs() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Logs</h1>
          <p className="mt-1 text-sm text-zinc-500">API request history, post delivery logs, and error traces</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-500">All types &#9662;</span>
          <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-500">Last 24h &#9662;</span>
        </div>
      </div>

      {/* Log filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {["All", "API Requests", "Posts", "Webhooks", "Errors"].map((filter, i) => (
          <button
            key={filter}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              i === 0
                ? "bg-white/[0.08] text-zinc-100"
                : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">Timestamp</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Path</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-5 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04]">
                    <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <p className="text-sm text-zinc-500">No log entries yet</p>
                  <p className="text-xs text-zinc-600">API requests and post activity will appear here</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
