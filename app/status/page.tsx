import type { Metadata } from "next";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Status — baliyoban",
  description: "Current system status and uptime for baliyoban services.",
};

const SERVICES = [
  { name: "API", status: "Operational", uptime: "100%" },
  { name: "Dashboard", status: "Operational", uptime: "100%" },
  { name: "Authentication", status: "Operational", uptime: "100%" },
  { name: "Post Delivery", status: "Operational", uptime: "100%" },
  { name: "Webhooks", status: "Operational", uptime: "100%" },
  { name: "Analytics", status: "Operational", uptime: "100%" },
  { name: "MCP Server", status: "Operational", uptime: "100%" },
];

export default function Status() {
  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <MarketingNav />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">System Status</h1>
          <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            All Systems Operational
          </span>
        </div>

        <div className="mt-12 space-y-3">
          {SERVICES.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-medium text-zinc-200">{s.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-emerald-400">{s.status}</span>
                <span className="text-zinc-500">{s.uptime} uptime</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-zinc-200">Recent Incidents</h2>
          <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-8 text-center">
            <p className="text-sm text-zinc-500">No incidents reported</p>
          </div>
        </div>
      </div>
    </main>
  );
}
