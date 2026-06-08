import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Meta (Facebook/Instagram) Data Deletion Request Callback.
// Meta POSTs a `signed_request` we must verify with the app secret, then delete
// the user's data and return { url, confirmation_code } so the user can track it.
// Docs: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64");
}

function parseSignedRequest(signedRequest: string, secret: string) {
  const [encodedSig, encodedPayload] = signedRequest.split(".");
  if (!encodedSig || !encodedPayload) return null;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest();
  const actualSig = base64UrlDecode(encodedSig);

  if (
    expectedSig.length !== actualSig.length ||
    !crypto.timingSafeEqual(expectedSig, actualSig)
  ) {
    return null;
  }

  return JSON.parse(base64UrlDecode(encodedPayload).toString("utf8")) as {
    user_id?: string;
  };
}

export async function POST(req: NextRequest) {
  const secret = process.env.AUTH_FACEBOOK_SECRET;
  if (!secret) {
    return Response.json({ error: "Not configured" }, { status: 500 });
  }

  const form = await req.formData();
  const signedRequest = form.get("signed_request");
  if (typeof signedRequest !== "string") {
    return Response.json({ error: "Missing signed_request" }, { status: 400 });
  }

  const data = parseSignedRequest(signedRequest, secret);
  if (!data?.user_id) {
    return Response.json({ error: "Invalid signed_request" }, { status: 400 });
  }

  // The Facebook user id maps to Account.providerAccountId for provider "facebook".
  const account = await prisma.account.findFirst({
    where: { provider: "facebook", providerAccountId: data.user_id },
    select: { userId: true },
  });

  if (account) {
    // Deleting the user cascades to their accounts, sessions, and posts.
    await prisma.user.delete({ where: { id: account.userId } });
  }

  const confirmationCode = crypto
    .createHash("sha256")
    .update(`${data.user_id}:${Date.now()}`)
    .digest("hex")
    .slice(0, 16);

  const origin = req.nextUrl.origin;
  return Response.json({
    url: `${origin}/data-deletion?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}
