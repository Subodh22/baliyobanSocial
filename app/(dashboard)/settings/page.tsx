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
      <div className="mb-11">
        <h1 className="font-[family-name:var(--font-jetbrains-mono)] text-[21px] font-medium tracking-[-0.02em]">Settings</h1>
        <p className="mt-1.5 text-sm text-[#5A5A5A]">Account preferences and connected platforms.</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="border border-[#E8E8E8] rounded p-6">
          <div className="flex items-baseline justify-between mb-[18px]">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.04em] text-[#969696]">Profile</span>
          </div>
          <div className="space-y-[22px]">
            <div>
              <label className="block text-[13px] font-medium text-[#0A0A0A] mb-[7px]">Display name</label>
              <input
                type="text"
                defaultValue={name}
                className="w-full border border-[#DEDEDE] rounded px-[13px] py-[10px] text-[13.5px] text-[#0A0A0A] bg-white focus:outline-none focus:border-[#0A0A0A] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#0A0A0A] mb-[7px]">Email</label>
              <input
                type="email"
                defaultValue={email ?? ""}
                disabled
                className="w-full border border-[#DEDEDE] rounded px-[13px] py-[10px] text-[13.5px] text-[#969696] bg-[#F6F6F6] disabled:cursor-not-allowed"
              />
              <p className="mt-[7px] text-xs text-[#969696] font-[family-name:var(--font-jetbrains-mono)]">Managed by your authentication provider (Clerk)</p>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <Suspense>
          <ConnectedAccounts accounts={accounts} />
        </Suspense>

        {/* Plan */}
        <div className="border border-[#E8E8E8] rounded p-6">
          <div className="flex items-baseline justify-between mb-4">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.04em] text-[#969696]">Plan</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10.5px] font-medium text-[#0A0A0A] bg-[#F4F4F4] border border-[#DEDEDE] px-2 py-[2px] rounded-[3px] uppercase tracking-[0.03em]">Free</span>
            <span className="text-sm text-[#5A5A5A]">
              Everything is free while baliyoban is in early access. Paid plans
              are on the{" "}
              <Link href="/roadmap" className="text-[#0A0A0A] underline">
                roadmap
              </Link>
              .
            </span>
          </div>
        </div>

        {/* Danger zone */}
        <div className="border border-[#CC2A1E]/20 rounded p-6">
          <div className="flex items-baseline justify-between mb-4">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.04em] text-[#CC2A1E]">Danger Zone</span>
          </div>
          <p className="text-sm text-[#5A5A5A]">
            Permanently delete your account and all associated data.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/data-deletion"
              className="rounded border border-[#CC2A1E]/30 px-[15px] py-[9px] text-[13px] font-medium text-[#CC2A1E] transition-colors hover:bg-red-50"
            >
              Delete Account
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="rounded border border-[#DEDEDE] px-[15px] py-[9px] text-[13px] font-[450] text-[#5A5A5A] transition-colors hover:bg-[#F6F6F6] hover:text-[#0A0A0A]"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
