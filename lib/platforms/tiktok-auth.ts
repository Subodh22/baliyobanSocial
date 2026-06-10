import { prisma } from "@/lib/db";

/**
 * Refreshes an expired TikTok access token and persists the new credentials.
 */
async function refreshAccessToken(account: {
  id: string;
  refresh_token: string | null;
}): Promise<string | null> {
  if (!account.refresh_token) return null;

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.AUTH_TIKTOK_ID!,
      client_secret: process.env.AUTH_TIKTOK_SECRET!,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error || !data.access_token) {
    console.error("TikTok token refresh failed:", JSON.stringify(data));
    return null;
  }

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? account.refresh_token,
      expires_at: data.expires_in
        ? Math.floor(Date.now() / 1000) + data.expires_in
        : null,
    },
  });

  return data.access_token;
}

/**
 * Looks up the user's TikTok account and returns a valid access token,
 * refreshing it if necessary. Returns an error object on failure.
 */
export async function getTikTokAccount(userId: string): Promise<
  | { accessToken: string; account: { id: string; scope: string | null } }
  | { error: string; status: number }
> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "tiktok" },
  });

  if (!account || !account.access_token) {
    return { error: "TikTok account not connected", status: 404 };
  }

  let accessToken = account.access_token;
  const now = Math.floor(Date.now() / 1000);
  if (account.expires_at && account.expires_at <= now + 60) {
    const refreshed = await refreshAccessToken(account);
    if (!refreshed) {
      return {
        error: "Session expired \u2014 please reconnect TikTok.",
        status: 401,
      };
    }
    accessToken = refreshed;
  }

  return {
    accessToken,
    account: { id: account.id, scope: account.scope },
  };
}
