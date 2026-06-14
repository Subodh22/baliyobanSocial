// Posts to the user's first managed Facebook Page.
// Requires pages_manage_posts permission.
export async function postToFacebook(
  accessToken: string,
  text: string,
  mediaUrl?: string,
  mediaType?: "image" | "video"
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

  // Video: use the Page Videos endpoint
  if (mediaUrl && mediaType === "video") {
    const res = await fetch(
      `https://graph.facebook.com/${pageId}/videos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_url: mediaUrl,
          description: text,
          access_token: pageToken,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error?.message ?? "Facebook video post failed" };
    }

    const data = await res.json();
    return { ok: true, url: `https://facebook.com/${data.id}` };
  }

  // Image or text: use the Page Feed endpoint
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

// Posts a photo or video to Instagram using the Instagram Graph API.
// Requires instagram_business_content_publish permission.
export async function postToInstagram(
  accessToken: string,
  igUserId: string,
  text: string,
  mediaUrl?: string,
  mediaType?: "image" | "video"
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!mediaUrl)
    return { ok: false, error: "Instagram requires an image or video URL" };

  const isVideo = mediaType === "video";
  const igId = igUserId;

  // Create media container (video uses video_url + media_type REELS)
  const containerBody: Record<string, string> = {
    caption: text,
    access_token: accessToken,
  };
  if (isVideo) {
    containerBody.video_url = mediaUrl;
    containerBody.media_type = "REELS";
  } else {
    containerBody.image_url = mediaUrl;
  }

  const containerRes = await fetch(
    `https://graph.instagram.com/${igId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(containerBody),
    }
  );

  if (!containerRes.ok) {
    const err = await containerRes.json().catch(() => ({}));
    return { ok: false, error: err.error?.message ?? "Instagram upload failed" };
  }

  const { id: creationId } = await containerRes.json();

  // Poll until the container is ready before publishing.
  // Videos can take a while; images are usually fast but still need a moment.
  const maxAttempts = isVideo ? 30 : 10;
  let finished = false;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(
      `https://graph.instagram.com/${creationId}?fields=status_code&access_token=${accessToken}`
    );
    if (statusRes.ok) {
      const status = await statusRes.json();
      if (status.status_code === "FINISHED") { finished = true; break; }
      if (status.status_code === "ERROR")
        return { ok: false, error: "Instagram media processing failed" };
    }
  }

  if (!finished)
    return { ok: false, error: "Instagram media processing timed out — try a shorter or smaller video" };

  // Publish the container
  const publishRes = await fetch(
    `https://graph.instagram.com/${igId}/media_publish`,
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
