import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { ensureUser } from "@/lib/user";
import { postToTwitter } from "@/lib/platforms/twitter";
import { postToFacebook, postToInstagram } from "@/lib/platforms/facebook";
import { postToLinkedIn } from "@/lib/platforms/linkedin";
import { postToTikTok } from "@/lib/platforms/tiktok";
import { postToYouTube } from "@/lib/platforms/youtube";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Keep a Prisma User row for the FK on Post.
  await ensureUser();

  let body: { content: string; mediaUrl?: string; mediaType?: "image" | "video"; platforms: string[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { content, mediaUrl, mediaType, platforms } = body;

  if (!content?.trim())
    return Response.json({ error: "Content is required" }, { status: 400 });

  // Load all connected accounts for this user
  const accounts = await prisma.account.findMany({
    where: { userId },
  });

  const accountByProvider = Object.fromEntries(
    accounts.map((a) => [a.provider, a])
  );

  const results: Record<string, { ok: boolean; url?: string; error?: string }> =
    {};

  for (const platform of platforms) {
    switch (platform) {
      case "twitter": {
        const acc = accountByProvider["twitter"];
        if (!acc?.access_token) {
          results.twitter = { ok: false, error: "Twitter not connected" };
        } else {
          results.twitter = await postToTwitter(acc.access_token, content, mediaUrl, mediaType);
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
          results.youtube = await postToYouTube(
            acc.access_token,
            mediaUrl ?? "",
            content.slice(0, 100),
            content
          );
        }
        break;
      }
    }
  }

  await prisma.post.create({
    data: {
      userId,
      content,
      mediaUrl,
      platforms: JSON.stringify(platforms),
      results: JSON.stringify(results),
    },
  });

  return Response.json({ results });
}
