import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { buildAuthUrl } from "@/lib/platforms/tiktok-auth";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const redirectUri = `${base}/api/auth/callback/tiktok`;

  // Use the Clerk userId as state to tie the callback back to the user.
  // In production you'd use a signed/encrypted CSRF token.
  const state = userId;

  const url = buildAuthUrl(redirectUri, state);
  redirect(url);
}
