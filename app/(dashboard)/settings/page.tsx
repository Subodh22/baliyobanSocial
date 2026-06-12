import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { ConnectedAccounts } from "@/app/components/connected-accounts";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { getDashboardProps } from "@/app/components/dashboard-page";

const CONTACT_EMAIL = "subodhmaharjan3@gmail.com";

export default async function Settings() {
  const [{ name, email }, { userId }] = await Promise.all([
    getDashboardProps(),
    auth(),
  ]);

  const accounts = userId
    ? await prisma.account.findMany({
        where: { userId },
        select: { provider: true, providerAccountId: true },
      })
    : [];

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Account preferences and connected platforms</p>
      </div>

      <div className="mt-8 space-y-6 max-w-2xl">
        {/* Profile */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-zinc-200">Profile</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400">Display Name</label>
              <input
                type="text"
                defaultValue={name}
                disabled
                className="mt-1 w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-zinc-300 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400">Email</label>
              <input
                type="email"
                defaultValue={email ?? ""}
                disabled
                className="mt-1 w-full rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-zinc-300 disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-zinc-600">Managed by your authentication provider (Clerk)</p>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <Suspense>
          <ConnectedAccounts accounts={accounts} />
        </Suspense>

        {/* Plan */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-zinc-200">Plan</h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400">Free</span>
            <span className="text-sm text-zinc-500">
              Everything is free while baliyoban is in early access. Paid plans
              are on the{" "}
              <Link href="/roadmap" className="text-indigo-400 hover:text-indigo-300">
                roadmap
              </Link>
              .
            </span>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-6">
          <h2 className="text-lg font-semibold text-red-200">Danger Zone</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Permanently delete your account and all associated data.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/data-deletion"
              className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
            >
              Delete Account
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
