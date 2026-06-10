import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import {
  freshInstagramAccessToken,
  igHasScope,
  IG_MESSAGES_SCOPE,
} from "@/lib/oauth/instagram";

// Sends a direct-message reply to an Instagram user via the Send API. Note:
// Instagram only permits sending within 24h of the user's last message.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { recipient_id, message } = await req.json();
  if (!recipient_id || !message?.trim())
    return Response.json(
      { error: "recipient_id and message are required" },
      { status: 400 }
    );

  const account = await prisma.account.findFirst({
    where: { userId, provider: "instagram" },
  });
  if (!account)
    return Response.json({ error: "Instagram not connected" }, { status: 404 });

  if (!igHasScope(account.scope, IG_MESSAGES_SCOPE))
    return Response.json(
      { error: "Message access not granted. Please reconnect Instagram.", needsReconnect: true },
      { status: 403 }
    );

  const token = await freshInstagramAccessToken(account);
  if (!token)
    return Response.json(
      { error: "Instagram session expired — please reconnect.", needsReconnect: true },
      { status: 403 }
    );

  const res = await fetch(
    `https://graph.instagram.com/me/messages?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipient_id },
        message: { text: message.trim() },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok || data.error) {
    console.error("Instagram DM send failed:", JSON.stringify(data));
    return Response.json(
      { error: data.error?.message || "Failed to send message" },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
