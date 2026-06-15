import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AnalyticsClient from "./analytics-client";

export default async function Analytics() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { provider: true },
  });
  const providers = new Set(accounts.map((a) => a.provider));

  return (
    <>
      <div className="mb-11">
        <h1 className="font-[family-name:var(--font-jetbrains-mono)] text-[21px] font-medium tracking-[-0.02em]">
          Analytics
        </h1>
        <p className="mt-1.5 text-sm text-[#5A5A5A]">
          Publishing history and engagement across your accounts.
        </p>
      </div>

      <AnalyticsClient
        hasTikTok={providers.has("tiktok")}
        hasInstagram={providers.has("instagram")}
      />
    </>
  );
}
