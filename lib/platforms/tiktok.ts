// TikTok Content Posting API.
//
// Two posting modes:
//  - Inbox upload (postToTikTokInbox): pushes the video into the creator's
//    TikTok inbox, where they tap a notification to finish posting in the app.
//    Works for UNAUDITED apps and needs only the video.upload scope. Default.
//  - Direct Post (postToTikTokDirect): publishes straight to the profile with a
//    user-chosen privacy level and interaction settings. Requires the app to be
//    AUDITED by TikTok plus the video.publish scope, and is gated behind
//    TIKTOK_DIRECT_POST_ENABLED. The compliant picker lives in
//    compose/tiktok-options.tsx (privacy, comment/duet/stitch, commercial
//    disclosure, compliance text) per TikTok's content-sharing guidelines.
//
// Both transfer the media via PULL_FROM_URL, so the URL's host must be verified
// with TikTok. We proxy Blob media under /media on our own verified domain —
// see toVerifiedMediaUrl in lib/publish.ts and the rewrite in next.config.ts.

const TIKTOK_API = "https://open.tiktokapis.com/v2";

export type TikTokDirectPostOptions = {
  // One of the values from creator_info.privacy_level_options.
  privacyLevel: string;
  allowComment: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  // Commercial content disclosure (maps to TikTok's brand toggles).
  yourBrand: boolean;
  brandedContent: boolean;
};

export type TikTokCreatorInfo = {
  nickname: string;
  username: string;
  avatarUrl: string;
  privacyOptions: string[];
  commentDisabled: boolean;
  duetDisabled: boolean;
  stitchDisabled: boolean;
  maxDurationSec: number;
};

type Result = { ok: boolean; url?: string; note?: string; error?: string };

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json; charset=UTF-8",
  };
}

// TikTok wraps every response in { data, error: { code, message } } and returns
// HTTP 200 even for logical failures, so success means code === "ok".
function failed(
  res: Response,
  json: { error?: { code?: string } }
): boolean {
  return !res.ok || Boolean(json.error?.code && json.error.code !== "ok");
}

// Queries the creator's current posting eligibility and settings. Required
// before a Direct Post (to respect allowed privacy levels + interaction limits)
// and used to drive the compose UI. Needs the video.publish scope.
export async function queryCreatorInfo(
  accessToken: string
): Promise<{ ok: true; info: TikTokCreatorInfo } | { ok: false; error: string }> {
  const res = await fetch(`${TIKTOK_API}/post/publish/creator_info/query/`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
  const json = await res.json().catch(() => ({}));
  if (failed(res, json)) {
    console.error("TikTok creator_info error:", JSON.stringify(json));
    return {
      ok: false,
      error:
        json.error?.message ??
        json.error?.code ??
        "Could not query TikTok creator info",
    };
  }
  const d = json.data ?? {};
  return {
    ok: true,
    info: {
      nickname: d.creator_nickname ?? "",
      username: d.creator_username ?? "",
      avatarUrl: d.creator_avatar_url ?? "",
      privacyOptions: d.privacy_level_options ?? [],
      commentDisabled: Boolean(d.comment_disabled),
      duetDisabled: Boolean(d.duet_disabled),
      stitchDisabled: Boolean(d.stitch_disabled),
      maxDurationSec: d.max_video_post_duration_sec ?? 0,
    },
  };
}

// Pushes the video to the creator's TikTok inbox to finish posting manually.
// Works for unaudited apps; needs only the video.upload scope.
export async function postToTikTokInbox(
  accessToken: string,
  videoUrl: string
): Promise<Result> {
  if (!videoUrl) return { ok: false, error: "TikTok requires a video URL" };

  const res = await fetch(`${TIKTOK_API}/post/publish/inbox/video/init/`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      source_info: { source: "PULL_FROM_URL", video_url: videoUrl },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (failed(res, json)) {
    console.error("TikTok inbox/video/init error:", JSON.stringify(json));
    return { ok: false, error: json.error?.message ?? "TikTok upload failed" };
  }
  return {
    ok: true,
    note: "Sent to your TikTok inbox — open the TikTok app and tap the notification to finish posting.",
  };
}

// Publishes straight to the creator's profile. Requires an audited app +
// video.publish scope. Validates against live creator_info so we respect the
// account's allowed privacy levels and interaction settings.
export async function postToTikTokDirect(
  accessToken: string,
  videoUrl: string,
  caption: string,
  options: TikTokDirectPostOptions
): Promise<Result> {
  if (!videoUrl) return { ok: false, error: "TikTok requires a video URL" };

  const creator = await queryCreatorInfo(accessToken);
  if (!creator.ok) return { ok: false, error: creator.error };
  const info = creator.info;

  if (!info.privacyOptions.includes(options.privacyLevel)) {
    return {
      ok: false,
      error: "Selected TikTok privacy level isn't available for this account.",
    };
  }
  // TikTok rejects branded content that isn't publicly visible.
  if (options.brandedContent && options.privacyLevel === "SELF_ONLY") {
    return {
      ok: false,
      error: "Branded content can't be posted privately. Choose a public audience.",
    };
  }

  const res = await fetch(`${TIKTOK_API}/post/publish/video/init/`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      post_info: {
        title: caption.slice(0, 2200),
        privacy_level: options.privacyLevel,
        // Honour the user's choice, but never enable an interaction the account
        // itself has switched off.
        disable_comment: !options.allowComment || info.commentDisabled,
        disable_duet: !options.allowDuet || info.duetDisabled,
        disable_stitch: !options.allowStitch || info.stitchDisabled,
        brand_organic_toggle: options.yourBrand,
        brand_content_toggle: options.brandedContent,
      },
      source_info: { source: "PULL_FROM_URL", video_url: videoUrl },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (failed(res, json)) {
    console.error("TikTok video/init error:", JSON.stringify(json));
    return { ok: false, error: json.error?.message ?? "TikTok post failed" };
  }
  return {
    ok: true,
    note: "Publishing to TikTok — it may take a few minutes to appear.",
  };
}
