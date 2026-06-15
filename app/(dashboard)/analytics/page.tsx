import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AnalyticsClient from "./analytics-client";

async function AnalyticsData() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { provider: true },
  });
  const providers = new Set(accounts.map((a: { provider: string }) => a.provider));

  return (
    <AnalyticsClient
      hasTikTok={providers.has("tiktok")}
      hasInstagram={providers.has("instagram")}
    />
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="mt-8 animate-pulse">
      <div className="grid grid-cols-3 border border-[#E8E8E8] rounded overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`p-5 ${i < 3 ? "border-r border-[#E8E8E8]" : ""}`}>
            <div className="h-8 w-12 rounded bg-[#E8E8E8] mb-2" />
            <div className="h-3 w-24 rounded bg-[#F4F4F4]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
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

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsData />
      </Suspense>
    </>
  );
}
