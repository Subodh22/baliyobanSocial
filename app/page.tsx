import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

const PLATFORMS = [
  { name: "Twitter / X", icon: "𝕏", color: "bg-black border-zinc-700" },
  { name: "Instagram", icon: "📷", color: "bg-gradient-to-r from-purple-600 to-pink-500 border-transparent" },
  { name: "Facebook", icon: "f", color: "bg-blue-600 border-transparent" },
  { name: "LinkedIn", icon: "in", color: "bg-blue-700 border-transparent" },
  { name: "TikTok", icon: "♪", color: "bg-black border-zinc-700" },
  { name: "YouTube", icon: "▶", color: "bg-red-600 border-transparent" },
];

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 gap-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">SocialHub</h1>
        <p className="text-xl text-zinc-400 max-w-md">
          Write once. Post to all your social media accounts simultaneously.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-sm w-full">
        {PLATFORMS.map((p) => (
          <div
            key={p.name}
            className={`rounded-xl border p-4 flex flex-col items-center gap-2 text-sm font-medium ${p.color}`}
          >
            <span className="text-2xl">{p.icon}</span>
            <span className="text-xs text-zinc-200">{p.name}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-zinc-500 text-sm">Sign in with any connected account to get started</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <SignInButton provider="twitter" label="Connect Twitter/X" />
          <SignInButton provider="facebook" label="Connect Facebook / Instagram" />
          <SignInButton provider="linkedin" label="Connect LinkedIn" />
          <SignInButton provider="tiktok" label="Connect TikTok" />
          <SignInButton provider="google" label="Connect YouTube" />
        </div>
      </div>
    </main>
  );
}

function SignInButton({ provider, label }: { provider: string; label: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn(provider, { redirectTo: "/dashboard" });
      }}
    >
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-medium transition-colors"
      >
        {label}
      </button>
    </form>
  );
}
