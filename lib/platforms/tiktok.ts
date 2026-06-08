// Posts a video via the TikTok Content Posting API (Direct Post).
// Requires the video.publish scope.
//
// TikTok's audit requires querying creator_info BEFORE publishing so the app can
// respect the creator's available privacy levels and posting eligibility. Until
// an app passes audit it may only post privately (SELF_ONLY); creator_info also
// tells us which privacy levels the account actually allows.
// Docs: https://developers.tiktok.com/doc/content-posting-api-reference-query-creator-info
export async function postToTikTok(
  accessToken: string,
  videoUrl: string,
  caption: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!videoUrl)
    return { ok: false, error: "TikTok requires a video URL" };

  // 1. Query creator info to confirm eligibility and allowed privacy levels.
  const infoRes = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  );

  if (!infoRes.ok) {
    const err = await infoRes.json().catch(() => ({}));
    return {
      ok: false,
      error: err.error?.message ?? "Could not query TikTok creator info",
    };
  }

  const info = await infoRes.json();
  const options: string[] = info.data?.privacy_level_options ?? [];
  // Prefer the most private option the account allows (always valid pre-audit).
  const privacyLevel =
    options.find((o) => o === "SELF_ONLY") ?? options[0] ?? "SELF_ONLY";

  // 2. Initialize the upload (pull the video from a public URL).
  const initRes = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: caption.slice(0, 150),
          privacy_level: privacyLevel,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: videoUrl,
        },
      }),
    }
  );

  if (!initRes.ok) {
    const err = await initRes.json().catch(() => ({}));
    return { ok: false, error: err.error?.message ?? "TikTok upload failed" };
  }

  const data = await initRes.json();
  const publishId = data.data?.publish_id;
  return {
    ok: true,
    url: publishId
      ? `https://www.tiktok.com/ (post processing, publish_id: ${publishId})`
      : undefined,
  };
}
