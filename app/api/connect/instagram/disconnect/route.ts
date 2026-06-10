import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// Disconnects the user's Instagram account by removing the stored credentials.
// The Instagram Login flow has no token-revoke endpoint, so this just clears
// our copy; the user can revoke app access from Instagram's settings.
export async function POST() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "instagram" },
  });
  if (!account)
    return Response.json({ error: "Not connected" }, { status: 404 });

  await prisma.account.delete({ where: { id: account.id } });

  return Response.json({ ok: true });
}
