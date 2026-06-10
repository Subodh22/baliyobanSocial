import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// Disconnects the Gmail account: revokes the token (best-effort) and removes
// the stored credentials.
export async function POST() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "gmail" },
  });
  if (!account)
    return Response.json({ error: "Not connected" }, { status: 404 });

  const token = account.refresh_token || account.access_token;
  if (token) {
    try {
      await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token }),
      });
    } catch (e) {
      console.error("Gmail token revoke failed (continuing):", e);
    }
  }

  await prisma.account.delete({ where: { id: account.id } });
  return Response.json({ ok: true });
}
