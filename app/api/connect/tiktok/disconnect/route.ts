import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// Disconnects the user's TikTok account: revokes the token on TikTok's side
// (best-effort) and removes the stored credentials.
export async function POST() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "tiktok" },
  });
  if (!account)
    return Response.json({ error: "Not connected" }, { status: 404 });

  // Best-effort revoke so a later reconnect forces a fresh consent screen.
  if (account.access_token) {
    try {
      await fetch("https://open.tiktokapis.com/v2/oauth/revoke/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: process.env.AUTH_TIKTOK_ID!,
          client_secret: process.env.AUTH_TIKTOK_SECRET!,
          token: account.access_token,
        }),
      });
    } catch (e) {
      console.error("TikTok token revoke failed (continuing):", e);
    }
  }

  await prisma.account.delete({ where: { id: account.id } });

  return Response.json({ ok: true });
}
