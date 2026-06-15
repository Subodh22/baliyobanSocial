import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import NewConnectionButton from "./new-connection-button";
import ConnectionActions from "./connection-actions";

const PROVIDER_META: Record<string, { label: string; icon: string }> = {
  twitter:   { label: "Twitter / X", icon: "𝕏" },
  facebook:  { label: "Facebook",    icon: "f" },
  instagram: { label: "Instagram",   icon: "📷" },
  linkedin:  { label: "LinkedIn",    icon: "in" },
  tiktok:    { label: "TikTok",      icon: "♪" },
  google:    { label: "YouTube",     icon: "▶" },
  gmail:     { label: "Gmail",       icon: "✉" },
};

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  let accounts: { provider: string; providerAccountId: string }[] = [];
  let dbError: string | null = null;
  try {
    accounts = await prisma.account.findMany({
      where: { userId },
      select: { provider: true, providerAccountId: true },
    });
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  if (dbError) {
    const urlScheme = process.env.TURSO_DATABASE_URL?.split(":")[0] ?? "(unset)";
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded border border-[#CC2A1E]/20 bg-red-50 p-8">
          <h1 className="text-2xl font-bold text-[#CC2A1E]">Database not ready</h1>
          <p className="mt-2 text-sm text-[#5A5A5A]">
            You&rsquo;re signed in, but the dashboard couldn&rsquo;t reach the database.
          </p>
          <pre className="mt-6 overflow-x-auto rounded border border-[#CC2A1E]/20 bg-white p-4 text-xs text-[#CC2A1E]">
            {dbError}
          </pre>
          <ul className="mt-6 space-y-1.5 text-sm text-[#5A5A5A]">
            <li>TURSO_DATABASE_URL scheme: <code className="rounded bg-[#F4F4F4] px-1.5 py-0.5 text-[#0A0A0A]">{urlScheme}</code></li>
            <li>TURSO_AUTH_TOKEN set: <code className="rounded bg-[#F4F4F4] px-1.5 py-0.5 text-[#0A0A0A]">{String(Boolean(process.env.TURSO_AUTH_TOKEN))}</code></li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-11">
        <h1 className="font-[family-name:var(--font-jetbrains-mono)] text-[21px] font-medium tracking-[-0.02em] text-[#0A0A0A]">Connections</h1>
        <p className="mt-1.5 text-sm text-[#5A5A5A]">The accounts Social Hub can publish to and read from.</p>
      </div>

      {/* Section header */}
      <div className="flex items-baseline justify-between mb-[18px]">
        <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.04em] text-[#969696]">Connected</span>
        <NewConnectionButton />
      </div>

      {/* Cards */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center rounded border border-dashed border-[#DEDEDE] bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-[#0A0A0A]">Connect your first account</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-[#5A5A5A]">
            Link a social account with &ldquo;Add account&rdquo; above, then
            post to all of them at once from the composer.
          </p>
          <Link
            href="/compose"
            className="mt-6 inline-flex items-center gap-2 rounded bg-[#0A0A0A] px-[15px] py-[9px] text-[13px] font-medium text-white transition-opacity hover:opacity-85"
          >
            Try the composer
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      ) : (
        <div className="border border-[#E8E8E8] rounded overflow-hidden">
          {accounts.map((acc, i) => {
            const meta = PROVIDER_META[acc.provider] ?? { label: acc.provider, icon: "•" };
            return (
              <div
                key={acc.provider}
                className={`group flex items-center gap-4 px-5 py-[18px] transition-colors hover:bg-[#F6F6F6] ${
                  i < accounts.length - 1 ? "border-b border-[#E8E8E8]" : ""
                }`}
              >
                <div className="flex h-[34px] w-[34px] items-center justify-center rounded bg-[#0A0A0A] text-white text-sm font-bold shrink-0">
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[9px] text-sm font-medium text-[#0A0A0A]">
                    {meta.label}
                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10.5px] font-medium text-[#5A5A5A] bg-[#F4F4F4] border border-[#DEDEDE] px-[7px] py-[2px] rounded-[3px]">
                      Default
                    </span>
                  </div>
                  <p className="text-[13px] text-[#969696] font-[family-name:var(--font-jetbrains-mono)] truncate">
                    {acc.providerAccountId}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-[450] text-[#1F7A4D]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1F7A4D]" />
                  Connected
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ConnectionActions provider={acc.provider} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {accounts.length > 0 && (
        <p className="mt-[18px] text-[13px] text-[#969696] text-center font-[family-name:var(--font-jetbrains-mono)]">
          {accounts.length} account{accounts.length !== 1 ? "s" : ""} connected
        </p>
      )}
    </>
  );
}
