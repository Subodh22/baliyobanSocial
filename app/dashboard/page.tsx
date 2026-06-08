import { auth, signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";

const PROVIDER_META: Record<string, { label: string; icon: string; color: string }> = {
  twitter:  { label: "Twitter / X",  icon: "𝕏",  color: "bg-zinc-900 border-zinc-700" },
  facebook: { label: "Facebook",     icon: "f",   color: "bg-blue-900 border-blue-700" },
  linkedin: { label: "LinkedIn",     icon: "in",  color: "bg-blue-800 border-blue-600" },
  tiktok:   { label: "TikTok",       icon: "♪",   color: "bg-zinc-900 border-zinc-700" },
  google:   { label: "YouTube",      icon: "▶",   color: "bg-red-900 border-red-700" },
};

const CONNECT_PROVIDERS = [
  { provider: "twitter",  label: "Connect Twitter / X" },
  { provider: "facebook", label: "Connect Facebook + Instagram" },
  { provider: "linkedin", label: "Connect LinkedIn" },
  { provider: "tiktok",   label: "Connect TikTok" },
  { provider: "google",   label: "Connect YouTube" },
];

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    select: { provider: true, providerAccountId: true },
  });

  const recentPosts = await prisma.post.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const connectedProviders = new Set(accounts.map((a) => a.provider));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">SocialHub</h1>
        <div className="flex gap-3 items-center">
          <span className="text-zinc-400 text-sm">{session.user.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Connected Accounts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(PROVIDER_META).map(([provider, meta]) => {
            const connected = connectedProviders.has(provider);
            return (
              <div
                key={provider}
                className={`rounded-xl border p-4 flex items-center gap-3 ${meta.color}`}
              >
                <span className="text-2xl">{meta.icon}</span>
                <div>
                  <p className="text-sm font-medium">{meta.label}</p>
                  <p className={`text-xs ${connected ? "text-green-400" : "text-zinc-500"}`}>
                    {connected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {CONNECT_PROVIDERS.filter((p) => !connectedProviders.has(p.provider)).map((p) => (
            <form
              key={p.provider}
              action={async () => {
                "use server";
                await signIn(p.provider, { redirectTo: "/dashboard" });
              }}
            >
              <button className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium transition-colors">
                + {p.label}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Posts</h2>
          <Link
            href="/compose"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition-colors"
          >
            + New Post
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <p className="text-zinc-500 text-sm">No posts yet. Create your first one!</p>
        ) : (
          <ul className="space-y-3">
            {recentPosts.map((post) => {
              const results = post.results ? JSON.parse(post.results) : {};
              const platforms: string[] = post.platforms ? JSON.parse(post.platforms) : [];
              const successCount = Object.values(results).filter((r: any) => r.ok).length;
              return (
                <li key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <p className="text-sm text-zinc-100 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="text-green-400">{successCount}/{platforms.length} posted</span>
                    <span>{platforms.join(", ")}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
