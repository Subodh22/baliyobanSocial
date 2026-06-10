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
          "&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return null;
      const msg = await res.json();
      const headers = msg.payload?.headers ?? [];
      return {
        id,
        source: "gmail",
        kind: "email",
        author: senderName(header(headers, "From")),
        title: header(headers, "Subject") || "(no subject)",
        snippet: msg.snippet ?? "",
        timestamp: msg.internalDate
          ? Math.floor(Number(msg.internalDate) / 1000)
          : Math.floor(Date.now() / 1000),
        url: `https://mail.google.com/mail/u/0/#inbox/${id}`,
      };
    })
  );

  return items.filter((i): i is InboxItem => i !== null);
}
