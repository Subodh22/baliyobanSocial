// Posts a share to LinkedIn on behalf of the authenticated user.
// Requires w_member_social scope.
export async function postToLinkedIn(
  accessToken: string,
  personId: string,
  text: string,
  mediaUrl?: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const body: Record<string, unknown> = {
    author: `urn:li:person:${personId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: mediaUrl ? "IMAGE" : "NONE",
        ...(mediaUrl
          ? {
              media: [
                {
                  status: "READY",
                  description: { text },
                  originalUrl: mediaUrl,
                },
              ],
            }
          : {}),
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.message ?? "LinkedIn post failed" };
  }

  const data = await res.json();
  const postId = data.id?.split(":").pop();
  return {
    ok: true,
    url: `https://www.linkedin.com/feed/update/${data.id}/`,
  };
}
