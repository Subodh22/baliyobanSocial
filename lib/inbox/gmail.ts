import { freshGoogleAccessToken } from "@/lib/oauth/google";
import type { InboxItem } from "./types";

type Account = {
  id: string;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: number | null;
};

function header(headers: { name: string; value: string }[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

// Strips a display-name/email "From" header down to just the readable name.
function senderName(from: string): string {
  const match = from.match(/^\s*"?([^"<]+?)"?\s*</);
  return (match ? match[1] : from).trim() || from;
}

export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

// True if a stored Gmail account's granted scopes include send permission.
export function gmailCanSend(scope: string | null | undefined): boolean {
  return (scope ?? "").split(/\s+/).includes(GMAIL_SEND_SCOPE);
}

// Pulls the bare email address out of a "Name <email>" header.
export function emailAddress(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).trim();
}

// Fetches recent inbox emails and maps them to InboxItems.
export async function fetchGmail(account: Account): Promise<InboxItem[]> {
  const token = await freshGoogleAccessToken(account);
  if (!token) throw new Error("Gmail session expired — please reconnect.");

  const listRes = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?" +
      new URLSearchParams({ maxResults: "15", q: "in:inbox" }).toString(),
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const listData = await listRes.json();
  if (!listRes.ok || listData.error)
    throw new Error(listData.error?.message || "Could not load Gmail");

  const ids: string[] = (listData.messages ?? []).map((m: { id: string }) => m.id);

  const items = await Promise.all(
    ids.map(async (id): Promise<InboxItem | null> => {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?` +
          new URLSearchParams({
            format: "metadata",
          }).toString() +
          "&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date&metadataHeaders=Message-ID",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return null;
      const msg = await res.json();
      const headers = msg.payload?.headers ?? [];
      const from = header(headers, "From");
      return {
        id,
        source: "gmail",
        kind: "email",
        author: senderName(from),
        title: header(headers, "Subject") || "(no subject)",
        snippet: msg.snippet ?? "",
        timestamp: msg.internalDate
          ? Math.floor(Number(msg.internalDate) / 1000)
          : Math.floor(Date.now() / 1000),
        url: `https://mail.google.com/mail/u/0/#inbox/${id}`,
        threadId: msg.threadId,
        fromEmail: emailAddress(from),
        messageId: header(headers, "Message-ID"),
      };
    })
  );

  return items.filter((i): i is InboxItem => i !== null);
}

type GmailPart = {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPart[];
};

// Walks a Gmail payload tree and returns the decoded body, preferring
// text/plain. Falls back to a crude tag-strip of text/html if that's all
// there is.
function extractBody(part: GmailPart | undefined): string {
  if (!part) return "";
  const plain = findPart(part, "text/plain");
  if (plain) return decodeB64Url(plain);
  const html = findPart(part, "text/html");
  if (html) return decodeB64Url(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return "";
}

function findPart(part: GmailPart, mimeType: string): string | undefined {
  if (part.mimeType === mimeType && part.body?.data) return part.body.data;
  for (const child of part.parts ?? []) {
    const found = findPart(child, mimeType);
    if (found) return found;
  }
  return undefined;
}

function decodeB64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

export type GmailMessageDetail = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  fromEmail: string;
  to: string;
  date: string;
  messageId: string;
  body: string;
};

// Fetches a single email in full (with body) for the reading/reply view.
export async function fetchGmailMessage(
  account: Account,
  id: string
): Promise<GmailMessageDetail> {
  const token = await freshGoogleAccessToken(account);
  if (!token) throw new Error("Gmail session expired — please reconnect.");

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const msg = await res.json();
  if (!res.ok || msg.error)
    throw new Error(msg.error?.message || "Could not load message");

  const headers = msg.payload?.headers ?? [];
  const from = header(headers, "From");
  return {
    id,
    threadId: msg.threadId,
    subject: header(headers, "Subject") || "(no subject)",
    from: senderName(from),
    fromEmail: emailAddress(from),
    to: header(headers, "To"),
    date: header(headers, "Date"),
    messageId: header(headers, "Message-ID"),
    body: extractBody(msg.payload) || msg.snippet || "",
  };
}
