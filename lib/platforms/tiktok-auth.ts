// TikTok OAuth helpers — authorization URL building, token exchange, and refresh.
// Docs: https://developers.tiktok.com/doc/oauth-user-access-token-management

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";

/** Scopes requested during authorization. */
export const TIKTOK_SCOPES = [
  "user.info.basic",
  "video.publish",
  "video.upload",
  "video.list",
];

export function getTikTokClientKey() {
  const key = process.env.AUTH_TIKTOK_ID;
  if (!key) throw new Error("AUTH_TIKTOK_ID is not set");
  return key;
}

function getTikTokClientSecret() {
  const secret = process.env.AUTH_TIKTOK_SECRET;
  if (!secret) throw new Error("AUTH_TIKTOK_SECRET is not set");
  return secret;
}

/** Build the TikTok authorization URL the user is redirected to. */
export function buildAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_key: getTikTokClientKey(),
    response_type: "code",
    scope: TIKTOK_SCOPES.join(","),
    redirect_uri: redirectUri,
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

export interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  open_id: string;
  expires_in: number;
  refresh_expires_in: number;
  scope: string;
  token_type: string;
}

/** Exchange an authorization code for access + refresh tokens. */
export async function exchangeCode(
  code: string,
  redirectUri: string,
): Promise<TikTokTokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: getTikTokClientKey(),
      client_secret: getTikTokClientSecret(),
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  const json = await res.json();
  if (json.error) {
    throw new Error(json.error_description ?? json.error);
  }
  return json as TikTokTokenResponse;
}

/** Refresh an expired access token using the refresh token. */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<TikTokTokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: getTikTokClientKey(),
      client_secret: getTikTokClientSecret(),
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const json = await res.json();
  if (json.error) {
    throw new Error(json.error_description ?? json.error);
  }
  return json as TikTokTokenResponse;
}
