import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { fetchGmail, gmailCanSend } from "@/lib/inbox/gmail";

// Lists the connected Gmail account's recent inbox emails (with the metadata
// needed to compose threaded replies) plus whether send permission is granted.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "gmail" },
  });
  if (!account)
    return Response.json({ error: "Gmail not connected" }, { status: 404 });

  try {
    const items = await fetchGmail(account);
    return Response.json({ items, canSend: gmailCanSend(account.scope) });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to load Gmail" },
      { status: 502 }
    );
  }
}
