import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "linkedin" },
  });
  if (!account)
    return Response.json({ error: "Not connected" }, { status: 404 });

  if (account.access_token) {
    try {
      await fetch("https://www.linkedin.com/oauth/v2/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.AUTH_LINKEDIN_ID!,
          client_secret: process.env.AUTH_LINKEDIN_SECRET!,
          token: account.access_token,
        }),
      });
    } catch (e) {
      console.error("LinkedIn token revoke failed (continuing):", e);
    }
  }

  await prisma.account.delete({ where: { id: account.id } });
  return Response.json({ ok: true });
}
