import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { freshGoogleAccessToken } from "@/lib/oauth/google";
import { gmailCanSend } from "@/lib/inbox/gmail";

// Encodes a header value that may contain non-ASCII using RFC 2047 so the
// raw MIME message stays 7-bit clean.
function encodeHeader(value: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf-8").toString("base64")}?=`;
}

// Sends a new email or a threaded reply via the Gmail API. For a reply, pass
// threadId + inReplyTo (the original Message-ID) so Gmail keeps the thread.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { to, subject, body, threadId, inReplyTo } = await req.json();
  if (!to?.trim() || !body?.trim())
    return Response.json(
      { error: "to and body are required" },
      { status: 400 }
    );

  const account = await prisma.account.findFirst({
    where: { userId, provider: "gmail" },
  });
  if (!account)
    return Response.json({ error: "Gmail not connected" }, { status: 404 });

  if (!gmailCanSend(account.scope))
    return Response.json(
      {
        error: "Send permission not granted. Please reconnect Gmail.",
        needsReconnect: true,
      },
      { status: 403 }
    );

  const token = await freshGoogleAccessToken(account);
  if (!token)
    return Response.json(
      { error: "Gmail session expired — please reconnect.", needsReconnect: true },
      { status: 403 }
    );

  const lines = [
    `To: ${encodeHeader(to.trim())}`,
    `Subject: ${encodeHeader(subject?.trim() || "(no subject)")}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
  ];
  if (inReplyTo) {
    lines.push(`In-Reply-To: ${inReplyTo}`);
    lines.push(`References: ${inReplyTo}`);
  }
  lines.push("", body);
  const raw = Buffer.from(lines.join("\r\n"), "utf-8").toString("base64url");

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(threadId ? { raw, threadId } : { raw }),
    }
  );
  const data = await res.json();
  if (!res.ok || data.error) {
    console.error("Gmail send failed:", JSON.stringify(data));
    return Response.json(
      { error: data.error?.message || "Failed to send email" },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, id: data.id });
}
