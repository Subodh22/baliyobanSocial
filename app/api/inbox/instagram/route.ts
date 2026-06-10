import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { fetchInstagram } from "@/lib/inbox/instagram";
import {
  igHasScope,
  IG_COMMENTS_SCOPE,
  IG_MESSAGES_SCOPE,
} from "@/lib/oauth/instagram";

// Returns the connected Instagram account's recent comments and DMs, plus which
// permissions were granted so the UI can prompt a reconnect when missing.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId, provider: "instagram" },
  });
  if (!account)
    return Response.json({ error: "Instagram not connected" }, { status: 404 });

  const canComments = igHasScope(account.scope, IG_COMMENTS_SCOPE);
  const canMessages = igHasScope(account.scope, IG_MESSAGES_SCOPE);

  try {
    const { comments, dms, errors } = await fetchInstagram(account);
    return Response.json({ comments, dms, errors, canComments, canMessages });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to load Instagram" },
      { status: 502 }
    );
  }
}
