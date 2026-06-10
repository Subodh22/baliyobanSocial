import { redirect } from "next/navigation";
import { ensureUser } from "@/lib/user";

export async function getDashboardProps() {
  const profile = await ensureUser();
  if (!profile) redirect("/");

  const name = profile.name ?? profile.email?.split("@")[0] ?? "Account";
  const email = profile.email ?? null;

  return { name, email };
}
