import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ComposeClient from "./compose-client";

export default async function Compose() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { provider: true },
  });

  return (
    <ComposeClient
      connectedProviders={accounts.map((a) => a.provider)}
      tiktokDirectPost
    />
  );
}
