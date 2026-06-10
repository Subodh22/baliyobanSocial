import { prisma } from "@/lib/db";

// Shared helper for the "Instagram API with Instagram Login" flow. Long-lived
// IG tokens (~60 days) are refreshed by re-presenting the token itself via
// ig_refresh_token; this returns a valid token, refreshing + persisting first
// if it has expired (or is within a day of doing so).
export async function freshInstagramAccessToken(account: {
  id: string;
  access_token: string | null;
  expires_at: number | null;
}): Promise<string | null> {
  if (!account.access_token) return null;

  const now = Math.floor(Date.now() / 1000);
  if (!account.expires_at || account.expires_at > now + 86400) {
    return account.access_token;
  }

  const res = await fetch(
    "https://graph.instagram.com/refresh_access_token?" +
      new URLSearchParams({
        grant_type: "ig_refresh_token",
        access_token: account.access_token,
      }).toString()
  );
  const data = await res.json();
  if (!res.ok || data.error || !data.access_token) {
    console.error("Instagram token refresh failed:", JSON.stringify(data));
    return null;
  }

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      refresh_token: data.access_token,
      expires_at: data.expires_in
        ? Math.floor(Date.now() / 1000) + data.expires_in
        : null,
    },
  });

  return data.access_token;
}

export const IG_COMMENTS_SCOPE = "instagram_business_manage_comments";
export const IG_MESSAGES_SCOPE = "instagram_business_manage_messages";

export function igHasScope(
  scope: string | null | undefined,
  needed: string
): boolean {
  return (scope ?? "").split(",").includes(needed);
}
