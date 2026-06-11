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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Publishing history and engagement across your connected platforms
        </p>
      </div>

      <AnalyticsClient
        hasTikTok={providers.has("tiktok")}
        hasInstagram={providers.has("instagram")}
      />
    </>
  );
}
