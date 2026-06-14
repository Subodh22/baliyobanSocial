// Posts a share to LinkedIn on behalf of the authenticated user.
// Uses the Community Management Posts API (w_member_social_v2 scope).
export async function postToLinkedIn(
  accessToken: string,
  personId: string,
  text: string,
  mediaUrl?: string,
  mediaType?: "image" | "video"
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const body: Record<string, unknown> = {
    author: `urn:li:person:${personId}`,
    lifecycleState: "PUBLISHED",
    visibility: "PUBLIC",
    commentary: text,
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
  };

  if (mediaUrl) {
    body.content = {
      media: {
        altText: text.slice(0, 200),
        id: mediaUrl,
      },
    };
  }

  const res = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202402",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.message ?? "LinkedIn post failed" };
  }

  // The Posts API returns 201 with the post URN in the x-restli-id header.
  const postUrn = res.headers.get("x-restli-id") ?? "";
  return {
    ok: true,
    url: postUrn
      ? `https://www.linkedin.com/feed/update/${postUrn}/`
      : undefined,
  };
}
