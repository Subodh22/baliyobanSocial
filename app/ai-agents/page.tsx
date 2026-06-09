import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "AI Agents — baliyoban",
  description: "MCP server with 280+ tools. Let AI agents manage your social media.",
};

const CAPABILITIES = [
  { title: "Post & Schedule", desc: "Create posts, attach media, and schedule for optimal times across 15 platforms" },
  { title: "Read Analytics", desc: "Pull engagement metrics, follower counts, and performance data into your AI workflow" },
  { title: "Manage Inbox", desc: "Read DMs, comments, and mentions. Draft and send replies via natural language" },
  { title: "Manage Accounts", desc: "Connect new platforms, check connection status, and manage profiles" },
  { title: "Run Ad Campaigns", desc: "Create, pause, and adjust ad campaigns across 6 networks" },
  { title: "Generate Reports", desc: "Build custom analytics reports with cross-platform comparisons" },
];

const CLIENTS = [
  { name: "Claude Desktop", desc: "Anthropic's desktop client with native MCP support" },
  { name: "Cursor", desc: "AI-powered code editor with MCP integration" },
  { name: "Custom Agents", desc: "Any MCP-compatible client or framework" },
];

export default function AiAgents() {
  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <MarketingNav />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EB3514]" />
            MCP Server
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Social media for AI agents
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            280+ tools via Model Context Protocol. Your AI agent can post, schedule, analyze, and manage DMs — all through natural language.
          </p>
        </div>

        {/* Code example */}
        <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-white/10 bg-[#1a1a1a] p-6 font-mono text-sm text-zinc-300">
          <p className="text-zinc-500"># Claude Desktop config</p>
          <pre className="mt-2 overflow-x-auto">{`{
  "mcpServers": {
    "baliyoban": {
      "command": "npx",
      "args": ["baliyoban-mcp"],
      "env": {
        "BALIYOBAN_API_KEY": "your-api-key"
      }
    }
  }
}`}</pre>
        </div>

        {/* Capabilities */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold tracking-tight">What your agent can do</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h3 className="font-semibold text-zinc-100">{c.title}</h3>
                <p className="mt-1.5 text-sm text-zinc-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compatible clients */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold tracking-tight">Compatible Clients</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {CLIENTS.map((c) => (
              <div key={c.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
                <h3 className="font-semibold text-zinc-100">{c.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/sign-up"
            className="inline-block rounded-lg bg-[#EB3514] px-8 py-3.5 text-lg font-semibold text-white transition-opacity hover:opacity-90"
          >
            Get Your API Key
          </Link>
        </div>
      </div>
    </main>
  );
}
