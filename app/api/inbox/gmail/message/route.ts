import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { fetchGmailMessage } from "@/lib/inbox/gmail";

// Returns a single email in full (with decoded body) for the reading pane.
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return Response.json({ error: "id is required" }, { status: 400 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "gmail" },
  });
  if (!account)
    return Response.json({ error: "Gmail not connected" }, { status: 404 });

  try {
    const message = await fetchGmailMessage(account, id);
    return Response.json({ message });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to load message" },
      { status: 502 }
    );
  }
}
