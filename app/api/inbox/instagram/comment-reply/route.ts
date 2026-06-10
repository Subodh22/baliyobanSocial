import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import {
  freshInstagramAccessToken,
  igHasScope,
  IG_COMMENTS_SCOPE,
} from "@/lib/oauth/instagram";

// Posts a reply to an Instagram comment.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { comment_id, message } = await req.json();
  if (!comment_id || !message?.trim())
    return Response.json(
      { error: "comment_id and message are required" },
      { status: 400 }
    );

  const account = await prisma.account.findFirst({
    where: { userId, provider: "instagram" },
  });
  if (!account)
    return Response.json({ error: "Instagram not connected" }, { status: 404 });

  if (!igHasScope(account.scope, IG_COMMENTS_SCOPE))
    return Response.json(
      { error: "Comment access not granted. Please reconnect Instagram.", needsReconnect: true },
      { status: 403 }
    );

  const token = await freshInstagramAccessToken(account);
  if (!token)
    return Response.json(
      { error: "Instagram session expired — please reconnect.", needsReconnect: true },
      { status: 403 }
    );

  // The Inbox prefixes comment ids with "igc_"; strip it for the API call.
  const id = String(comment_id).replace(/^igc_/, "");

  const res = await fetch(
    `https://graph.instagram.com/${id}/replies?` +
      new URLSearchParams({
        message: message.trim(),
        access_token: token,
      }).toString(),
    { method: "POST" }
  );
  const data = await res.json();
  if (!res.ok || data.error) {
    console.error("Instagram comment reply failed:", JSON.stringify(data));
    return Response.json(
      { error: data.error?.message || "Failed to send reply" },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, id: data.id });
}
