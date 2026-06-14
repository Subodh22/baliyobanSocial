import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File))
    return Response.json({ error: "No file provided" }, { status: 400 });

  try {
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return Response.json({ url: blob.url });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 },
    );
  }
}
