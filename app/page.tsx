import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

const LIVE_PLATFORMS = [
  "Twitter/X", "Instagram", "TikTok", "Facebook", "LinkedIn", "YouTube",
];

const PLANNED_PLATFORMS = [
  "WhatsApp", "Threads", "Reddit", "Pinterest",
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
  { q: "Can I schedule posts?", a: "Yes — pick a date and time in the composer and baliyoban publishes for you, or post instantly to all connected platforms at once." },
  { q: "Is baliyoban white-label friendly?", a: "White-label is on our roadmap for Business and Enterprise plans. It isn't available yet." },
  { q: "Will posting through baliyoban get my accounts banned or reduce reach?", a: "No. We only use official platform APIs, so your posts are treated exactly like native posts." },
  { q: "Can AI agents use baliyoban to post on social media?", a: "That's where we're headed: a public API and an MCP server are in development so agents can post, read analytics, and manage DMs. Join now and you'll get early access when they launch." },
  { q: "Which social media platforms does baliyoban support?", a: "Live today: Instagram, TikTok, Facebook, and YouTube — full connect, post, and engage. On the roadmap: X/Twitter, LinkedIn, WhatsApp, Threads, Pinterest, Reddit, Bluesky, Telegram, Google Business, Snapchat, and Discord, plus ad network integrations." },
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="bg-white text-[#0A0A0A]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[#E8E8E8] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-[10px]">
              <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#0A0A0A] text-white text-xs font-semibold">S</div>
              <span className="text-sm font-semibold tracking-[-0.02em]">baliyoban</span>
            </div>
            <div className="hidden items-center gap-6 text-sm text-[#5A5A5A] md:flex">
              <a href="#endpoints" className="hover:text-[#0A0A0A]">Docs</a>
              <a href="#what" className="hover:text-[#0A0A0A]">Product</a>
              <a href="#platforms" className="hover:text-[#0A0A0A]">Platforms</a>
              <a href="#pricing" className="hover:text-[#0A0A0A]">Pricing</a>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/sign-in" className="text-[#5A5A5A] hover:text-[#0A0A0A]">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded bg-[#0A0A0A] px-4 py-2 font-medium text-white transition-opacity hover:opacity-85"
            >
              Start for Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pt-20 pb-16 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E8E8E8] bg-[#F6F6F6] px-3 py-1 text-xs font-medium text-[#5A5A5A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0A0A0A]" />
              What&apos;s new &middot; Unified inbox for Gmail, Instagram &amp; TikTok
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              The social media API for{" "}
              <span className="text-[#0A0A0A]">developers and AI agents</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[#5A5A5A]">
              Ship social features in minutes instead of months. Post, engage,
              and manage every major platform from one place — live on{" "}
              {LIVE_PLATFORMS.length} platforms today, with more launching on
              the <Link href="/roadmap" className="underline hover:text-[#0A0A0A]">roadmap</Link>.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="rounded bg-[#0A0A0A] px-6 py-3 font-medium text-white transition-opacity hover:opacity-85"
              >
                Start for Free
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center gap-2 rounded border border-[#DEDEDE] bg-white px-6 py-3 font-medium text-[#0A0A0A] hover:bg-[#F6F6F6]"
              >
                <span className="text-base font-bold">G</span> Continue with Google
              </Link>
            </div>
            <p className="mt-4 text-sm text-[#969696]">No credit card required</p>
          </div>

          {/* Code block */}
          <CodeBlock />
        </div>
      </section>

      {/* Platforms */}
      <section id="platforms" className="border-y border-[#E8E8E8] bg-[#F6F6F6] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.04em] text-[#969696]">
            One product &middot; {LIVE_PLATFORMS.length} platforms live &middot; {PLANNED_PLATFORMS.length} more on the roadmap
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {LIVE_PLATFORMS.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5 rounded-full border border-[#1F7A4D]/30 bg-green-50 px-4 py-1.5 text-sm text-[#0A0A0A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1F7A4D]" />
                {p}
              </span>
            ))}
            {PLANNED_PLATFORMS.map((p) => (
              <span key={p} className="rounded-full border border-[#E8E8E8] px-4 py-1.5 text-sm text-[#969696]">
                {p}
              </span>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-[#969696]">
            <span className="text-[#1F7A4D]">&#9679;</span> Live today &nbsp;&middot;&nbsp; Ad
            networks ({ADS.join(", ")}) are planned
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[#E8E8E8] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[#5A5A5A]">
            Go from signup to your first post across multiple platforms in under 5 minutes.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded border border-[#E8E8E8] p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A0A0A] text-sm font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold text-[#0A0A0A]">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#5A5A5A]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you can do — endpoints */}
      <section id="endpoints" className="mx-auto max-w-6xl px-6 py-20">
        <h2 id="what" className="scroll-mt-20 text-center text-3xl font-bold tracking-tight sm:text-4xl">What you can do</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[#5A5A5A]">
          A clean REST surface for everything social — posting, analytics, ads, and inbox.
        </p>
        <p className="mx-auto mt-3 w-fit rounded-full border border-[#9A6B00]/20 bg-amber-50 px-4 py-1.5 text-center text-xs text-[#9A6B00]">
          Public API in development — posting and inbox ship in the dashboard today
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="rounded border border-[#E8E8E8] p-6 font-[family-name:var(--font-jetbrains-mono)]">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    e.method === "GET" ? "bg-green-50 text-[#1F7A4D]" : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {e.method}
                </span>
                <span className="text-[#0A0A0A]">{e.path}</span>
              </div>
              <p className="mt-3 font-[family-name:var(--font-inter)] text-sm leading-relaxed text-[#5A5A5A]">{e.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm">
          <a href="#endpoints" className="font-medium text-[#0A0A0A] underline hover:opacity-55">
            See all endpoints &rarr;
          </a>
        </p>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#E8E8E8] bg-[#F6F6F6] py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-10 divide-y divide-[#E8E8E8]">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-[#0A0A0A]">
                  {f.q}
                  <span className="ml-4 text-[#969696] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#5A5A5A]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / final CTA */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Stop maintaining 21 integrations.
            <br />
            Start shipping features.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#5A5A5A]">
            Free up to 2 connected accounts. No credit card required.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/sign-up"
              className="rounded bg-[#0A0A0A] px-8 py-3.5 text-lg font-medium text-white transition-opacity hover:opacity-85"
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
    <div className="overflow-hidden rounded border border-[#E8E8E8] bg-[#F6F6F6] shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E8E8E8] bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#E8E8E8]" />
          <span className="h-3 w-3 rounded-full bg-[#E8E8E8]" />
          <span className="h-3 w-3 rounded-full bg-[#E8E8E8]" />
        </div>
        <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#969696]">schedule-post.ts</span>
        <span className="rounded bg-amber-50 border border-[#9A6B00]/20 px-2 py-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[#9A6B00]">
          API coming soon
        </span>
      </div>
      <pre className="overflow-x-auto p-5 font-[family-name:var(--font-jetbrains-mono)] text-[13px] leading-relaxed">
        <code>
          <span className="text-purple-600">const</span>{" "}
          <span className="text-blue-700">response</span>{" "}
          <span className="text-[#969696]">=</span>{" "}
          <span className="text-purple-600">await</span>{" "}
          <span className="text-amber-700">fetch</span>
          <span className="text-[#0A0A0A]">(</span>
          <span className="text-green-700">&quot;https://api.baliyoban.com/v1/posts&quot;</span>
          <span className="text-[#0A0A0A]">, {`{`}</span>
          {"\n  "}
          <span className="text-blue-700">method</span>
          <span className="text-[#0A0A0A]">: </span>
          <span className="text-green-700">&quot;POST&quot;</span>
          <span className="text-[#0A0A0A]">,</span>
          {"\n  "}
          <span className="text-blue-700">headers</span>
          <span className="text-[#0A0A0A]">: {`{`}</span>
          {"\n    "}
          <span className="text-green-700">&quot;Authorization&quot;</span>
          <span className="text-[#0A0A0A]">: </span>
          <span className="text-green-700">{"`Bearer ${API_KEY}`"}</span>
          <span className="text-[#0A0A0A]">,</span>
          {"\n  "}
          <span className="text-[#0A0A0A]">{`}`},</span>
          {"\n  "}
          <span className="text-blue-700">body</span>
          <span className="text-[#0A0A0A]">: </span>
          <span className="text-teal-700">JSON</span>
          <span className="text-[#0A0A0A]">.</span>
          <span className="text-amber-700">stringify</span>
          <span className="text-[#0A0A0A]">({`{`}</span>
          {"\n    "}
          <span className="text-blue-700">text</span>
          <span className="text-[#0A0A0A]">: </span>
          <span className="text-green-700">&quot;Shipping our new feature today&quot;</span>
          <span className="text-[#0A0A0A]">,</span>
          {"\n    "}
          <span className="text-blue-700">platforms</span>
          <span className="text-[#0A0A0A]">: [</span>
          <span className="text-green-700">&quot;twitter&quot;</span>
          <span className="text-[#0A0A0A]">, </span>
          <span className="text-green-700">&quot;linkedin&quot;</span>
          <span className="text-[#0A0A0A]">, </span>
          <span className="text-green-700">&quot;instagram&quot;</span>
          <span className="text-[#0A0A0A]">],</span>
          {"\n    "}
          <span className="text-blue-700">scheduledFor</span>
          <span className="text-[#0A0A0A]">: </span>
          <span className="text-green-700">&quot;2026-06-09T15:00:00Z&quot;</span>
          <span className="text-[#0A0A0A]">,</span>
          {"\n  "}
          <span className="text-[#0A0A0A]">{`}`}),</span>
          {"\n"}
          <span className="text-[#0A0A0A]">{`}`});</span>
        </code>
      </pre>
    </div>
  );
}
