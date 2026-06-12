import { prisma } from "@/lib/db";

// Twitter (X) OAuth 2.0 with PKCE. User tokens expire after ~2 hours; with the
// offline.access scope we get a refresh token and rotate it on every refresh.

export const TWITTER_AUTH_URL = "https://x.com/i/oauth2/authorize";
const TWITTER_TOKEN_URL = "https://api.x.com/2/oauth2/token";

export const TWITTER_SCOPE = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access",
].join(" ");

function basicAuth(): string {
  const id = process.env.AUTH_TWITTER_ID!;
  const secret = process.env.AUTH_TWITTER_SECRET!;
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

export async function exchangeTwitterCode(
  code: string,
  redirectUri: string,
  codeVerifier: string
): Promise<{ access_token: string; refresh_token?: string; expires_in?: number; scope?: string }> {
  const res = await fetch(TWITTER_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuth(),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      client_id: process.env.AUTH_TWITTER_ID!,
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error || !data.access_token) {
    throw new Error(data.error_description || data.error || "token_exchange_failed");
  }
  return data;
}

// Returns a valid access token for a stored Twitter account, refreshing (and
// persisting the rotated refresh token) if it has expired or is about to.
export async function freshTwitterAccessToken(account: {
  id: string;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: number | null;
}): Promise<string | null> {
  if (!account.access_token) return null;

  const now = Math.floor(Date.now() / 1000);
  if (!account.expires_at || account.expires_at > now + 60) {
    return account.access_token;
  }

  if (!account.refresh_token) return null;

  const res = await fetch(TWITTER_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuth(),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
      client_id: process.env.AUTH_TWITTER_ID!,
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error || !data.access_token) {
    console.error("Twitter token refresh failed:", JSON.stringify(data));
    return null;
  }

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      // X rotates refresh tokens — keep the new one or the old one stops working.
      refresh_token: data.refresh_token ?? account.refresh_token,
      expires_at: data.expires_in
        ? Math.floor(Date.now() / 1000) + data.expires_in
        : null,
    },
  });

  return data.access_token;
}
