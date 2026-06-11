import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

// Platforms with a working connect + post flow in the product today.
const LIVE_PLATFORMS = ["Instagram", "TikTok", "Facebook", "YouTube"];

const PLANNED_PLATFORMS = [
  "Twitter/X", "LinkedIn", "WhatsApp", "Threads", "Reddit", "Pinterest",
  "Bluesky", "Telegram", "Snapchat", "Google Business", "Discord",
];

const ADS = ["Meta Ads", "Google Ads", "LinkedIn Ads", "TikTok Ads", "Pinterest Ads", "X Ads"];

const STEPS = [
  { n: "1", title: "Sign up free.", body: "Google sign-in. Takes 30 seconds, no credit card." },
  { n: "2", title: "Connect accounts.", body: "Link social accounts via OAuth. No developer apps needed." },
  { n: "3", title: "Post everywhere.", body: "One composer, every connected platform. Replies and DMs in one inbox." },
];

const ENDPOINTS = [
  { method: "GET", path: "/connect/:platform", body: "One OAuth flow for every platform. No dev apps needed." },
  { method: "POST", path: "/posts", body: "One call, 15 platforms. Text, image, video, or carousel." },
  { method: "GET", path: "/analytics", body: "Likes, reach, impressions, clicks, views. Unified." },
  { method: "POST", path: "/ads/boost", body: "Boost any post to a paid ad on 6 ad networks." },
  { method: "POST", path: "/webhooks/settings", body: "Posts published or failed? Get pinged. No polling." },
  { method: "GET", path: "/inbox/conversations", body: "DMs, comments, reviews. One inbox. Reply via API." },
];

const FAQS = [
  { q: "How fast can I get started?", a: "Under five minutes: sign up, connect a social account via OAuth, and publish your first post from the composer. No developer apps or API reviews on your side." },
  { q: "Do I need to create developer apps for each platform?", a: "No. We handle all developer apps, approvals, and quota limits." },
  { q: "Can I schedule posts?", a: "Scheduling is in active development and rolling out soon. Today you can publish instantly to all connected platforms from one composer." },
  { q: "Is baliyoban white-label friendly?", a: "White-label is on our roadmap for Business and Enterprise plans. It isn't available yet." },
  { q: "Will posting through baliyoban get my accounts banned or reduce reach?", a: "No. We only use official platform APIs, so your posts are treated exactly like native posts." },
  { q: "Can AI agents use baliyoban to post on social media?", a: "That's where we're headed: a public API and an MCP server are in development so agents can post, read analytics, and manage DMs. Join now and you'll get early access when they launch." },
  { q: "Which social media platforms does baliyoban support?", a: "Live today: Instagram, TikTok, Facebook, and YouTube — full connect, post, and engage. On the roadmap: X/Twitter, LinkedIn, WhatsApp, Threads, Pinterest, Reddit, Bluesky, Telegram, Google Business, Snapchat, and Discord, plus ad network integrations." },
];

const ACCENT = "#EB3514";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold tracking-tight">baliyoban</span>
            <div className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
              <a href="#endpoints" className="hover:text-white">Docs</a>
              <a href="#what" className="hover:text-white">Product</a>
              <a href="#platforms" className="hover:text-white">Platforms</a>
              <a href="#pricing" className="hover:text-white">Pricing</a>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/sign-in" className="text-zinc-300 hover:text-white">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              Start for Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[500px] opacity-30"
          style={{ background: `radial-gradient(60% 60% at 50% 0%, ${ACCENT}33 0%, transparent 70%)` }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pt-20 pb-16 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
              What&apos;s new · Unified inbox for Gmail, Instagram &amp; TikTok
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              The social media API for{" "}
              <span style={{ color: ACCENT }}>developers and AI agents</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-zinc-400">
              Ship social features in minutes instead of months. Post, engage,
              and manage every major platform from one place — live on{" "}
              {LIVE_PLATFORMS.length} platforms today, with more launching on
              the <Link href="/roadmap" className="underline hover:text-zinc-200">roadmap</Link>.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                Start for Free
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                <span className="text-base font-bold">G</span> Continue with Google
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">No credit card required</p>
          </div>

          {/* Code block */}
          <CodeBlock />
        </div>
      </section>

      {/* Platforms */}
      <section id="platforms" className="border-y border-white/10 bg-[#0d0d0d] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-500">
            One product · {LIVE_PLATFORMS.length} platforms live · {PLANNED_PLATFORMS.length} more on the roadmap
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {LIVE_PLATFORMS.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-zinc-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {p}
              </span>
            ))}
            {PLANNED_PLATFORMS.map((p) => (
              <span key={p} className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-zinc-500">
                {p}
              </span>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-zinc-600">
            <span className="text-emerald-400">●</span> Live today &nbsp;·&nbsp; Ad
            networks ({ADS.join(", ")}) are planned
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10 bg-[#0d0d0d] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">
            Go from signup to your first post across multiple platforms in under 5 minutes.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you can do — endpoints */}
      <section id="endpoints" className="mx-auto max-w-6xl px-6 py-20">
        <h2 id="what" className="scroll-mt-20 text-center text-3xl font-bold tracking-tight sm:text-4xl">What you can do</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">
          A clean REST surface for everything social — posting, analytics, ads, and inbox.
        </p>
        <p className="mx-auto mt-3 w-fit rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-center text-xs text-amber-400/90">
          Public API in development — posting and inbox ship in the dashboard today
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="rounded-2xl border border-white/10 bg-white/5 p-6 font-mono">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    e.method === "GET" ? "bg-green-500/15 text-green-400" : "bg-blue-500/15 text-blue-400"
                  }`}
                >
                  {e.method}
                </span>
                <span className="text-zinc-200">{e.path}</span>
              </div>
              <p className="mt-3 font-sans text-sm leading-relaxed text-zinc-400">{e.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm">
          <a href="#endpoints" className="font-semibold hover:underline" style={{ color: ACCENT }}>
            See all endpoints →
          </a>
        </p>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10 bg-[#0d0d0d] py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-10 divide-y divide-white/10">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-white">
                  {f.q}
                  <span className="ml-4 text-zinc-500 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / final CTA */}
      <section id="pricing" className="relative overflow-hidden py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(50% 50% at 50% 50%, ${ACCENT}55 0%, transparent 70%)` }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Stop maintaining 21 integrations.
            <br />
            Start shipping features.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Free up to 2 connected accounts. No credit card required.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/sign-up"
              className="rounded-lg px-8 py-3.5 text-lg font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              Start for Free
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function CodeBlock() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#161616] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="font-mono text-xs text-zinc-500">schedule-post.ts</span>
        <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-400/90">
          API coming soon
        </span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
        <code>
          <span className="text-[#c586c0]">const</span>{" "}
          <span className="text-[#9cdcfe]">response</span>{" "}
          <span className="text-zinc-400">=</span>{" "}
          <span className="text-[#c586c0]">await</span>{" "}
          <span className="text-[#dcdcaa]">fetch</span>
          <span className="text-zinc-300">(</span>
          <span className="text-[#ce9178]">&quot;https://api.baliyoban.com/v1/posts&quot;</span>
          <span className="text-zinc-300">, {`{`}</span>
          {"\n  "}
          <span className="text-[#9cdcfe]">method</span>
          <span className="text-zinc-300">: </span>
          <span className="text-[#ce9178]">&quot;POST&quot;</span>
          <span className="text-zinc-300">,</span>
          {"\n  "}
          <span className="text-[#9cdcfe]">headers</span>
          <span className="text-zinc-300">: {`{`}</span>
          {"\n    "}
          <span className="text-[#ce9178]">&quot;Authorization&quot;</span>
          <span className="text-zinc-300">: </span>
          <span className="text-[#ce9178]">{"`Bearer ${API_KEY}`"}</span>
          <span className="text-zinc-300">,</span>
          {"\n  "}
          <span className="text-zinc-300">{`}`},</span>
          {"\n  "}
          <span className="text-[#9cdcfe]">body</span>
          <span className="text-zinc-300">: </span>
          <span className="text-[#4ec9b0]">JSON</span>
          <span className="text-zinc-300">.</span>
          <span className="text-[#dcdcaa]">stringify</span>
          <span className="text-zinc-300">({`{`}</span>
          {"\n    "}
          <span className="text-[#9cdcfe]">text</span>
          <span className="text-zinc-300">: </span>
          <span className="text-[#ce9178]">&quot;Shipping our new feature today 🚀&quot;</span>
          <span className="text-zinc-300">,</span>
          {"\n    "}
          <span className="text-[#9cdcfe]">platforms</span>
          <span className="text-zinc-300">: [</span>
          <span className="text-[#ce9178]">&quot;twitter&quot;</span>
          <span className="text-zinc-300">, </span>
          <span className="text-[#ce9178]">&quot;linkedin&quot;</span>
          <span className="text-zinc-300">, </span>
          <span className="text-[#ce9178]">&quot;instagram&quot;</span>
          <span className="text-zinc-300">],</span>
          {"\n    "}
          <span className="text-[#9cdcfe]">scheduledFor</span>
          <span className="text-zinc-300">: </span>
          <span className="text-[#ce9178]">&quot;2026-06-09T15:00:00Z&quot;</span>
          <span className="text-zinc-300">,</span>
          {"\n  "}
          <span className="text-zinc-300">{`}`}),</span>
          {"\n"}
          <span className="text-zinc-300">{`}`});</span>
        </code>
      </pre>
    </div>
  );
}
