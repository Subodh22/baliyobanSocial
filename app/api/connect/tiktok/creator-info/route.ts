import { auth } from "@clerk/nextjs/server";
import { getTikTokAccount } from "@/lib/platforms/tiktok-auth";
import { queryCreatorInfo } from "@/lib/platforms/tiktok";

// Returns the creator's current posting settings for the compose UI's Direct
// Post panel (allowed privacy levels, interaction limits, max video duration),
// as TikTok's content-sharing guidelines require showing these before posting.
// Needs the video.publish scope.
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getTikTokAccount(userId);
  if ("error" in result)
    return Response.json({ error: result.error }, { status: result.status });

  if (!(result.account.scope ?? "").split(",").includes("video.publish"))
    return Response.json(
      { error: "Reconnect TikTok to enable publishing.", needsReconnect: true },
      { status: 403 }
    );

  const info = await queryCreatorInfo(result.accessToken);
  if (!info.ok)
    return Response.json({ error: info.error }, { status: 400 });

  return Response.json(info.info);
}
