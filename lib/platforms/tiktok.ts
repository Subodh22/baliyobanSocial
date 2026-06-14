// Posts a video via the TikTok Content Posting API (Direct Post).
// Uses the video.upload scope — the creator_info and video/init endpoints
// accept either video.upload or video.publish.
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
    const msg =
      err.error?.message ??
      err.error?.code ??
      "Could not query TikTok creator info";
    console.error("TikTok creator_info error:", JSON.stringify(err));
    return { ok: false, error: msg };
  }

  const infoBody = await infoRes.json();
  // The error may come back as HTTP 200 with an error object
  if (infoBody.error?.code && infoBody.error.code !== "ok") {
    console.error("TikTok creator_info API error:", JSON.stringify(infoBody));
    return {
      ok: false,
      error: infoBody.error.message ?? infoBody.error.code,
    };
  }

  const options: string[] = infoBody.data?.privacy_level_options ?? [];
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
    const msg =
      err.error?.message ?? err.error?.code ?? "TikTok upload failed";
    console.error("TikTok video/init error:", JSON.stringify(err));
    return { ok: false, error: msg };
  }

  const initBody = await initRes.json();
  if (initBody.error?.code && initBody.error.code !== "ok") {
    console.error("TikTok video/init API error:", JSON.stringify(initBody));
    return {
      ok: false,
      error: initBody.error.message ?? initBody.error.code,
    };
  }

  const publishId = initBody.data?.publish_id;
  return {
    ok: true,
    url: publishId
      ? `https://www.tiktok.com/ (post processing, publish_id: ${publishId})`
      : undefined,
  };
}
