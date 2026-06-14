import { prisma } from "@/lib/db";
import { freshGoogleAccessToken } from "@/lib/oauth/google";
import { freshTwitterAccessToken } from "@/lib/oauth/twitter";
import { postToTwitter } from "@/lib/platforms/twitter";
import { postToFacebook, postToInstagram } from "@/lib/platforms/facebook";
import { postToLinkedIn } from "@/lib/platforms/linkedin";
import { postToTikTok } from "@/lib/platforms/tiktok";
import { postToYouTube } from "@/lib/platforms/youtube";

export type PublishResult = { ok: boolean; url?: string; error?: string };

// Publishes content to the given platforms using the user's connected
// accounts. Shared by the /api/post route (instant posts) and the cron
// publisher (scheduled posts).
export async function publishToPlatforms(
  userId: string,
  content: string,
  mediaUrl: string | undefined,
  mediaType: "image" | "video" | undefined,
  platforms: string[]
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
        const acc = accountByProvider["facebook"];
        if (!acc?.access_token) {
          results.instagram = { ok: false, error: "Instagram/Facebook not connected" };
        } else {
          results.instagram = await postToInstagram(acc.access_token, content, mediaUrl, mediaType);
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
        } else if (!(acc.scope ?? "").split(",").includes("video.publish")) {
          // Direct Post needs video.publish. Tokens minted before that scope
          // was granted fail with TikTok's raw "user did not authorize the
          // scope" error — surface a clear reconnect prompt instead.
          results.tiktok = {
            ok: false,
            error:
              "Publishing permission not granted. Please reconnect TikTok to allow posting.",
          };
        } else {
          results.tiktok = await postToTikTok(acc.access_token, mediaUrl ?? "", content);
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
