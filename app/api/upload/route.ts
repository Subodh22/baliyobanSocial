import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@clerk/nextjs/server";

// Issues short-lived client tokens so the browser uploads media straight to
// Vercel Blob — bypassing the serverless request-body size limit (~4.5MB),
// which large videos would otherwise hit.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/*", "video/*", "audio/*"],
        maximumSizeInBytes: 1024 * 1024 * 1024, // 1GB
        addRandomSuffix: true,
      }),
      // Runs when Vercel Blob confirms the upload (not reachable on localhost — fine).
      onUploadCompleted: async () => {},
    });
    return Response.json(json);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 }
    );
  }
}
