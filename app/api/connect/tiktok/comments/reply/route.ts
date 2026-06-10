import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTikTokAccount } from "@/lib/platforms/tiktok-auth";

// Posts a reply to a TikTok comment.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { video_id, comment_id, text } = await req.json();

  if (!video_id || !comment_id || !text?.trim()) {
    return Response.json(
      { error: "video_id, comment_id, and text are required" },
      { status: 400 }
    );
  }

  const result = await getTikTokAccount(userId);
  if ("error" in result)
    return Response.json({ error: result.error }, { status: result.status });

  const { accessToken, account } = result;

  const grantedScopes = (account.scope ?? "").split(",");
  if (!grantedScopes.includes("comment.list.manage")) {
    return Response.json(
      {
        error:
          "Reply permissions not granted. Please reconnect TikTok.",
        needsReconnect: true,
      },
      { status: 403 }
    );
  }

  const res = await fetch(
    "https://open.tiktokapis.com/v2/comment/reply/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_id,
        comment_id,
        text: text.trim(),
      }),
    }
  );

  const data = await res.json();

  if (data.error?.code && data.error.code !== "ok") {
    console.error("TikTok comment.reply error:", JSON.stringify(data.error));
    return Response.json(
      { error: data.error.message || data.error.code },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
