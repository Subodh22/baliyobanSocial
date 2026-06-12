import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "twitter" },
  });
  if (!account)
    return Response.json({ error: "Not connected" }, { status: 404 });

  const token = account.access_token;
  if (token) {
    try {
      await fetch("https://api.x.com/2/oauth2/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.AUTH_TWITTER_ID}:${process.env.AUTH_TWITTER_SECRET}`
            ).toString("base64"),
        },
        body: new URLSearchParams({
          token,
          token_type_hint: "access_token",
        }),
      });
    } catch (e) {
      console.error("Twitter token revoke failed (continuing):", e);
    }
  }

  await prisma.account.delete({ where: { id: account.id } });
  return Response.json({ ok: true });
}
