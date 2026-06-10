export default function Webhooks() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Webhooks</h1>
          <p className="mt-1 text-sm text-zinc-500">Get notified when posts are published, fail, or receive engagement</p>
        </div>
        <button
          disabled
          className="cursor-not-allowed rounded-lg bg-indigo-600/40 px-4 py-2 text-sm font-semibold text-indigo-300/60"
        >
          + Add Endpoint
        </button>
      </div>

      {/* Webhook endpoints */}
      <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">Endpoint URL</th>
              <th className="px-5 py-3 font-medium">Events</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Last Triggered</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">
                No webhook endpoints configured
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Available events */}
      <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-zinc-200">Available Events</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { event: "post.published", desc: "Fired when a post is successfully published to a platform" },
            { event: "post.failed", desc: "Fired when a post fails to publish" },
            { event: "post.scheduled", desc: "Fired when a post is scheduled for later" },
            { event: "engagement.mention", desc: "Fired when your account is mentioned" },
            { event: "engagement.comment", desc: "Fired when a post receives a comment" },
            { event: "engagement.like", desc: "Fired when a post receives a like or reaction" },
            { event: "inbox.message", desc: "Fired when a new DM is received" },
            { event: "account.disconnected", desc: "Fired when a platform connection expires or is revoked" },
          ].map((e) => (
            <div key={e.event} className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3">
              <p className="font-mono text-xs text-indigo-400">{e.event}</p>
              <p className="mt-1 text-xs text-zinc-500">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
