import { DashboardShell } from "@/app/components/dashboard-shell";
import { getDashboardProps } from "@/app/components/dashboard-page";

export default async function Inbox() {
  const { name, email } = await getDashboardProps();

  return (
    <DashboardShell active="Inbox" name={name} email={email}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Inbox</h1>
          <p className="mt-1 text-sm text-zinc-500">DMs, comments, and mentions across all platforms in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-500">All platforms &#9662;</span>
          <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-500">Unread &#9662;</span>
        </div>
      </div>

      <div className="mt-8 flex flex-1">
        {/* Conversation list */}
        <div className="w-full max-w-sm border-r border-white/[0.06]">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              disabled
            />
          </div>
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
              <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-zinc-300">No messages yet</p>
            <p className="mt-1 text-xs text-zinc-500">
              Connect your social accounts to see DMs, comments, and mentions here.
            </p>
          </div>
        </div>

        {/* Message detail */}
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <p className="text-sm text-zinc-500">Select a conversation to view messages</p>
            <p className="mt-1 text-xs text-zinc-600">Replies are sent via the platform&apos;s API</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
