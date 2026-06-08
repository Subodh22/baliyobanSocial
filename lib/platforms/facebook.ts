// Posts to the user's first managed Facebook Page.
// Requires pages_manage_posts permission.
export async function postToFacebook(
  accessToken: string,
  text: string,
  mediaUrl?: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  // Get managed pages
  const pagesRes = await fetch(
    `https://graph.facebook.com/me/accounts?access_token=${accessToken}`
  );
  if (!pagesRes.ok)
    return { ok: false, error: "Could not fetch Facebook pages" };

  const pagesData = await pagesRes.json();
  const page = pagesData.data?.[0];
  if (!page) return { ok: false, error: "No Facebook pages found" };

  const pageToken = page.access_token;
  const pageId = page.id;

  const endpoint = `https://graph.facebook.com/${pageId}/feed`;
  const body: Record<string, string> = {
    message: text,
    access_token: pageToken,
  };
  if (mediaUrl) body.link = mediaUrl;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.error?.message ?? "Facebook post failed" };
  }

  const data = await res.json();
  return {
    ok: true,
    url: `https://facebook.com/${data.id}`,
  };
}

// Posts a photo to Instagram Business account linked to the first Page.
// Requires instagram_basic,instagram_content_publish permissions.
export async function postToInstagram(
  accessToken: string,
  text: string,
  mediaUrl?: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!mediaUrl)
    return { ok: false, error: "Instagram requires an image or video URL" };

  // Get IG business account via linked page
  const pagesRes = await fetch(
    `https://graph.facebook.com/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
  );
  if (!pagesRes.ok)
    return { ok: false, error: "Could not fetch Instagram account" };

  const pagesData = await pagesRes.json();
  const igId = pagesData.data?.[0]?.instagram_business_account?.id;
  if (!igId) return { ok: false, error: "No Instagram Business account found" };

  // Create media container
  const containerRes = await fetch(
    `https://graph.facebook.com/${igId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: mediaUrl,
        caption: text,
        access_token: accessToken,
      }),
    }
  );

  if (!containerRes.ok) {
    const err = await containerRes.json().catch(() => ({}));
    return { ok: false, error: err.error?.message ?? "Instagram upload failed" };
  }

  const { id: creationId } = await containerRes.json();

  // Publish the container
  const publishRes = await fetch(
    `https://graph.facebook.com/${igId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: creationId, access_token: accessToken }),
    }
  );

  if (!publishRes.ok) {
    const err = await publishRes.json().catch(() => ({}));
    return { ok: false, error: err.error?.message ?? "Instagram publish failed" };
  }

  const { id: postId } = await publishRes.json();
  return { ok: true, url: `https://instagram.com/p/${postId}` };
}
