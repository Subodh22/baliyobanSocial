// Uploads a video to YouTube via the YouTube Data API v3.
// Requires youtube.upload scope.
export async function postToYouTube(
  accessToken: string,
  videoUrl: string,
  title: string,
  description: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!videoUrl)
    return { ok: false, error: "YouTube requires a video URL" };

  // Fetch the video file
  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok)
    return { ok: false, error: "Could not fetch video file" };

  const videoBuffer = await videoRes.arrayBuffer();

  // Initiate resumable upload
  const initRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": "video/*",
        "X-Upload-Content-Length": String(videoBuffer.byteLength),
      },
      body: JSON.stringify({
        snippet: { title, description, categoryId: "22" },
        status: { privacyStatus: "public" },
      }),
    }
  );

  if (!initRes.ok) {
    const err = await initRes.json().catch(() => ({}));
    return { ok: false, error: err.error?.message ?? "YouTube init failed" };
  }

  const uploadUrl = initRes.headers.get("Location");
  if (!uploadUrl) return { ok: false, error: "No upload URL from YouTube" };

  // Upload the video bytes
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "video/*",
    },
    body: videoBuffer,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    return { ok: false, error: err.error?.message ?? "YouTube upload failed" };
  }

  const data = await uploadRes.json();
  return {
    ok: true,
    url: `https://youtu.be/${data.id}`,
  };
}
