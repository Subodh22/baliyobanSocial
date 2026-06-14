import { auth } from "@clerk/nextjs/server";
import { put, getDownloadUrl } from "@vercel/blob";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token)
    return Response.json(
      { error: "File storage is not configured. Add BLOB_READ_WRITE_TOKEN to your environment." },
      { status: 500 },
    );

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File))
    return Response.json({ error: "No file provided" }, { status: 400 });

  try {
    const blob = await put(file.name, file, {
      access: "private",
      addRandomSuffix: true,
      token,
    });
    return Response.json({ url: getDownloadUrl(blob.url) });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 },
    );
  }
}
