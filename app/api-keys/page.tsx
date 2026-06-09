import { DashboardShell } from "@/app/components/dashboard-shell";
import { getDashboardProps } from "@/app/components/dashboard-page";

export default async function ApiKeys() {
  const { name, email } = await getDashboardProps();

  return (
    <DashboardShell active="API Keys" name={name} email={email}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">API Keys</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage keys for the baliyoban REST API and MCP server</p>
        </div>
        <button
          disabled
          className="cursor-not-allowed rounded-lg bg-indigo-600/40 px-4 py-2 text-sm font-semibold text-indigo-300/60"
        >
          + Create Key
        </button>
      </div>

      {/* Keys table */}
      <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Key</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 font-medium">Last Used</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                No API keys created yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Quick start */}
      <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-zinc-200">Quick Start</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Use your API key to authenticate requests to the baliyoban API.
        </p>
        <div className="mt-4 rounded-lg bg-[#1a1a1a] border border-white/[0.06] p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
          <pre>{`curl -X POST https://api.baliyoban.com/v1/posts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello world!", "platforms": ["twitter"]}'`}</pre>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-zinc-500">Rate limit:</span>
          <span className="text-zinc-300">10,000 requests / month (free tier)</span>
        </div>
      </div>
    </DashboardShell>
  );
}
