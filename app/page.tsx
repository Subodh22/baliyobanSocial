import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

const PLATFORMS = [
  { name: "Twitter / X", icon: "𝕏" },
  { name: "Instagram", icon: "📷" },
  { name: "Facebook", icon: "f" },
  { name: "LinkedIn", icon: "in" },
  { name: "TikTok", icon: "♪" },
  { name: "YouTube", icon: "▶" },
];

const CAPABILITIES = [
  {
    title: "Publish",
    body: "Write once and post text, images, and video to every connected account at the same time — no copy-pasting between apps.",
  },
  {
    title: "Connect",
    body: "Link Twitter/X, Instagram, Facebook, LinkedIn, TikTok, and YouTube with secure official OAuth. Connect once, post forever.",
  },
  {
    title: "Track results",
    body: "See exactly which platforms a post succeeded on, all in one place, the moment you publish.",
  },
  {
    title: "Your history",
    body: "Every post you send is saved with its per-platform outcome, so you always know what went where.",
  },
];

const STEPS = [
  { n: "1", title: "Sign in", body: "Sign in with any of your social accounts in one click." },
  { n: "2", title: "Connect accounts", body: "Authorize the platforms you want to post to." },
  { n: "3", title: "Write your post", body: "Compose your message and attach media once." },
  { n: "4", title: "Publish everywhere", body: "Hit post — baliyoban sends it to every platform at once." },
];

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex flex-col">
      {/* Nav */}
      <nav className="border-b border-zinc-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">baliyoban</span>
          <div className="flex items-center gap-6 text-sm">
            <a href="#how" className="hidden sm:inline text-zinc-600 hover:text-zinc-900">How it works</a>
            <a href="#pricing" className="hidden sm:inline text-zinc-600 hover:text-zinc-900">Pricing</a>
            <SignInButton provider="twitter" label="Sign in" small />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto w-full px-6 pt-20 pb-16 text-center">
        <span className="inline-block rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
          One post → 6 platforms
        </span>
        <h1 className="mt-6 text-5xl sm:text-6xl font-bold tracking-tight text-zinc-900">
          Write once.<br />Post everywhere.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600">
          baliyoban connects your social accounts and publishes your content to
          all of them at the same time — Twitter/X, Instagram, Facebook,
          LinkedIn, TikTok, and YouTube.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <SignInButton provider="twitter" label="Get started free" />
          <a
            href="#how"
            className="px-5 py-2.5 rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            See how it works
          </a>
        </div>

        {/* Platform row */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 shadow-sm"
            >
              <span className="text-base">{p.icon}</span>
              {p.name}
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">What baliyoban does</h2>
          <p className="mt-3 text-center text-zinc-600">Everything you need to run all your social accounts from one place.</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-5xl mx-auto w-full px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-zinc-200 p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {s.n}
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Simple pricing</h2>
          <p className="mt-3 text-zinc-600">Start free. Connect your accounts and post in minutes.</p>
          <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium text-indigo-600">Free</p>
            <p className="mt-2 text-4xl font-bold">$0</p>
            <p className="mt-1 text-sm text-zinc-500">while in early access</p>
            <ul className="mt-6 space-y-2 text-left text-sm text-zinc-600">
              <li>✓ Connect all 6 platforms</li>
              <li>✓ Unlimited cross-posts</li>
              <li>✓ Per-platform results &amp; history</li>
            </ul>
            <div className="mt-8 flex justify-center">
              <SignInButton provider="twitter" label="Get started" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SignInButton({
  provider,
  label,
  small = false,
}: {
  provider: string;
  label: string;
  small?: boolean;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn(provider, { redirectTo: "/dashboard" });
      }}
    >
      <button
        type="submit"
        className={
          small
            ? "px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
            : "px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
        }
      >
        {label}
      </button>
    </form>
  );
}
