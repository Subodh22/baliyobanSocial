import type { InboxItem } from "./types";

type Account = { access_token: string | null };

async function slackGet(
  token: string,
  method: string,
  params: Record<string, string>
) {
  const res = await fetch(
    `https://slack.com/api/${method}?` + new URLSearchParams(params).toString(),
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.json();
}

// Fetches recent messages from the user's DMs and channels.
export async function fetchSlack(account: Account): Promise<InboxItem[]> {
  const token = account.access_token;
  if (!token) throw new Error("Slack not connected");

  const convos = await slackGet(token, "users.conversations", {
    types: "im,mpim,public_channel,private_channel",
    limit: "12",
    exclude_archived: "true",
  });
  if (!convos.ok) throw new Error(convos.error || "Could not load Slack channels");

  // Cache user-id → display name lookups across all messages.
  const nameCache = new Map<string, string>();
  async function userName(id: string): Promise<string> {
    if (nameCache.has(id)) return nameCache.get(id)!;
    const info = await slackGet(token!, "users.info", { user: id });
    const name = info.ok
      ? info.user?.profile?.display_name || info.user?.real_name || info.user?.name || id
      : id;
    nameCache.set(id, name);
    return name;
  }

  const items: InboxItem[] = [];

  for (const conv of convos.channels ?? []) {
    const history = await slackGet(token, "conversations.history", {
      channel: conv.id,
      limit: "3",
    });
    if (!history.ok) continue;

    // Channel label: DM shows the other person's name; channels show #name.
    const channelLabel = conv.is_im
      ? await userName(conv.user)
      : `#${conv.name ?? "channel"}`;

    for (const msg of history.messages ?? []) {
      if (msg.subtype || !msg.text) continue; // skip joins/bot noise/empties
      const author = msg.user ? await userName(msg.user) : "Slack";
      items.push({
        id: `${conv.id}-${msg.ts}`,
        source: "slack",
        kind: conv.is_im ? "dm" : "message",
        author,
        title: channelLabel,
        snippet: msg.text,
        timestamp: Math.floor(Number(msg.ts)),
        url: undefined,
      });
    }
  }

  return items;
}
