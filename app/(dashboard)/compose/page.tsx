import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ComposeClient from "./compose-client";

async function ComposeData() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { provider: true },
  });

  return (
    <ComposeClient
      connectedProviders={accounts.map((a: { provider: string }) => a.provider)}
      tiktokDirectPost
    />
  );
}

function ComposeSkeleton() {
  return (
    <div className="space-y-[22px] animate-pulse">
      <div className="mb-11">
        <div className="h-6 w-24 rounded bg-[#E8E8E8]" />
        <div className="mt-3 h-4 w-64 rounded bg-[#F4F4F4]" />
      </div>
      <div>
        <div className="h-4 w-20 rounded bg-[#E8E8E8] mb-3" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 rounded border border-[#E8E8E8] bg-[#F4F4F4]" />
          ))}
        </div>
      </div>
      <div>
        <div className="h-4 w-16 rounded bg-[#E8E8E8] mb-3" />
        <div className="h-36 rounded border border-[#DEDEDE] bg-[#F6F6F6]" />
      </div>
    </div>
  );
}

export default function Compose() {
  return (
    <Suspense fallback={<ComposeSkeleton />}>
      <ComposeData />
    </Suspense>
  );
}
