import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUser } from "@/lib/user";

export async function getDashboardProps() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const profile = await ensureUser();
  const name = profile?.name ?? profile?.email?.split("@")[0] ?? "Account";
  const email = profile?.email ?? null;

  return { name, email };
}
