import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// Disconnects Slack: revokes the user token (best-effort) and removes the
// stored credentials.
export async function POST() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "slack" },
  });
  if (!account)
    return Response.json({ error: "Not connected" }, { status: 404 });

  if (account.access_token) {
    try {
      await fetch("https://slack.com/api/auth.revoke", {
        method: "POST",
        headers: { Authorization: `Bearer ${account.access_token}` },
      });
    } catch (e) {
      console.error("Slack token revoke failed (continuing):", e);
    }
  }

  await prisma.account.delete({ where: { id: account.id } });
  return Response.json({ ok: true });
}
