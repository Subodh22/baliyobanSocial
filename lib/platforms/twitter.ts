export async function postToTwitter(
  accessToken: string,
  text: string,
  mediaUrl?: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  // If media is provided, upload it first
  let mediaIds: string[] | undefined;
  if (mediaUrl) {
    // Twitter v2 media upload uses v1.1 endpoint
    const uploadRes = await fetch(
      "https://upload.twitter.com/1.1/media/upload.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ media_category: "tweet_image" }),
      }
    );
    if (uploadRes.ok) {
      const { media_id_string } = await uploadRes.json();
      mediaIds = [media_id_string];
    }
  }

  const body: Record<string, unknown> = { text };
  if (mediaIds) body.media = { media_ids: mediaIds };

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.detail ?? "Twitter post failed" };
  }

  const data = await res.json();
  const tweetId = data.data?.id;
  return {
    ok: true,
    url: `https://x.com/i/web/status/${tweetId}`,
  };
}
