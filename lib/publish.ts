import { prisma } from "@/lib/db";
import { freshGoogleAccessToken } from "@/lib/oauth/google";
import { freshInstagramAccessToken } from "@/lib/oauth/instagram";
import { freshTwitterAccessToken } from "@/lib/oauth/twitter";
import { postToTwitter } from "@/lib/platforms/twitter";
import { postToFacebook, postToInstagram } from "@/lib/platforms/facebook";
import { postToLinkedIn } from "@/lib/platforms/linkedin";
import {
  postToTikTokInbox,
  postToTikTokDirect,
  type TikTokDirectPostOptions,
} from "@/lib/platforms/tiktok";
import { postToYouTube } from "@/lib/platforms/youtube";

export type PublishResult = {
  ok: boolean;
  url?: string;
  note?: string;
  error?: string;
};

// TikTok PULL_FROM_URL requires the media URL's host to be verified with
// TikTok. Our uploads live on an unverifiable Vercel Blob host, so swap a blob
// URL for its proxied equivalent on our own verified domain (see the /media
// rewrite in next.config.ts). Non-blob URLs (e.g. a pasted link) pass through.
function toVerifiedMediaUrl(mediaUrl: string): string {
  const base = process.env.NEXTAUTH_URL;
  if (!base) return mediaUrl;
  try {
    const u = new URL(mediaUrl);
    if (!u.hostname.endsWith(".blob.vercel-storage.com")) return mediaUrl;
    return `${base.replace(/\/$/, "")}/media${u.pathname}`;
  } catch {
    return mediaUrl;
  }
}

// Publishes content to the given platforms using the user's connected
// accounts. Shared by the /api/post route (instant posts) and the cron
// publisher (scheduled posts).
export async function publishToPlatforms(
  userId: string,
  content: string,
  mediaUrl: string | undefined,
  mediaType: "image" | "video" | undefined,
  platforms: string[],
  // User-chosen TikTok Direct Post settings (instant posts only). When absent
  // — or when Direct Post is disabled — TikTok falls back to inbox upload.
  tiktok?: TikTokDirectPostOptions
): Promise<Record<string, PublishResult>> {
  const accounts = await prisma.account.findMany({ where: { userId } });
  const accountByProvider = Object.fromEntries(
    accounts.map((a) => [a.provider, a])
  );

  const results: Record<string, PublishResult> = {};

  for (const platform of platforms) {
    switch (platform) {
      case "twitter": {
        const acc = accountByProvider["twitter"];
        if (!acc?.access_token) {
          results.twitter = { ok: false, error: "Twitter not connected" };
        } else {
          // X access tokens expire after ~2h; refresh before posting.
          const token = await freshTwitterAccessToken(acc);
          if (!token) {
            results.twitter = { ok: false, error: "Twitter session expired — please reconnect." };
          } else {
            results.twitter = await postToTwitter(token, content, mediaUrl, mediaType);
          }
        }
        break;
      }
      case "facebook": {
        const acc = accountByProvider["facebook"];
        if (!acc?.access_token) {
          results.facebook = { ok: false, error: "Facebook not connected" };
        } else {
          results.facebook = await postToFacebook(acc.access_token, content, mediaUrl, mediaType);
        }
        break;
      }
      case "instagram": {
        const acc = accountByProvider["instagram"];
        if (!acc?.access_token) {
          results.instagram = { ok: false, error: "Instagram not connected" };
        } else {
          const token = await freshInstagramAccessToken(acc);
          if (!token) {
            results.instagram = { ok: false, error: "Instagram session expired — please reconnect." };
          } else {
            results.instagram = await postToInstagram(token, acc.providerAccountId, content, mediaUrl, mediaType);
          }
        }
        break;
      }
      case "linkedin": {
        const acc = accountByProvider["linkedin"];
        if (!acc?.access_token) {
          results.linkedin = { ok: false, error: "LinkedIn not connected" };
        } else {
          results.linkedin = await postToLinkedIn(
            acc.access_token,
            acc.providerAccountId,
            content,
            mediaUrl,
            mediaType
          );
        }
        break;
      }
      case "tiktok": {
        const acc = accountByProvider["tiktok"];
        if (!acc?.access_token) {
          results.tiktok = { ok: false, error: "TikTok not connected" };
          break;
        }
        const granted = (acc.scope ?? "").split(",");
        // Direct Post publishes immediately and requires the video.publish
        // scope plus per-post settings from the compose UI. Falls back to
        // inbox upload for scheduled posts (no UI settings) or accounts
        // that only have video.upload.
        const useDirect =
          Boolean(tiktok) && granted.includes("video.publish");
        const videoUrl = toVerifiedMediaUrl(mediaUrl ?? "");
        if (useDirect) {
          const direct = await postToTikTokDirect(
            acc.access_token,
            videoUrl,
            content,
            tiktok!
          );
          if (direct.ok) {
            results.tiktok = direct;
          } else if (granted.includes("video.upload")) {
            // Direct Post failed (app may not be audited yet) — fall back to
            // inbox upload so the post still goes through.
            console.warn("TikTok Direct Post failed, falling back to inbox:", direct.error);
            results.tiktok = await postToTikTokInbox(acc.access_token, videoUrl);
          } else {
            results.tiktok = direct;
          }
        } else if (!granted.includes("video.upload")) {
          results.tiktok = {
            ok: false,
            error: "Upload permission not granted. Please reconnect TikTok.",
          };
        } else {
          results.tiktok = await postToTikTokInbox(acc.access_token, videoUrl);
        }
        break;
      }
      case "youtube": {
        const acc = accountByProvider["google"];
        if (!acc?.access_token) {
          results.youtube = { ok: false, error: "YouTube (Google) not connected" };
        } else {
          // Google access tokens expire hourly — refresh before uploading so
          // scheduled posts (and stale sessions) don't fail.
          const token = await freshGoogleAccessToken(acc);
          if (!token) {
            results.youtube = { ok: false, error: "YouTube session expired — please reconnect." };
          } else {
            results.youtube = await postToYouTube(
              token,
              mediaUrl ?? "",
              content.slice(0, 100),
              content
            );
          }
        }
        break;
      }
    }
  }

  return results;
}
