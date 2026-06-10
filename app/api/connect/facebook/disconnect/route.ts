import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const GRAPH_VERSION = "v23.0";

// Disconnects the user's Facebook account: revokes the app's permissions on
// Facebook's side (best-effort) and removes the stored credentials.
export async function POST() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "facebook" },
  });
  if (!account)
    return Response.json({ error: "Not connected" }, { status: 404 });

  // Best-effort permission revoke so a later reconnect forces a fresh consent.
  if (account.access_token) {
    try {
      await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/${account.providerAccountId}/permissions?` +
          new URLSearchParams({ access_token: account.access_token }).toString(),
        { method: "DELETE" }
      );
    } catch (e) {
      console.error("Facebook permission revoke failed (continuing):", e);
    }
  }

  await prisma.account.delete({ where: { id: account.id } });

  return Response.json({ ok: true });
}
