import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File))
    return Response.json({ error: "No file provided" }, { status: 400 });

  const blob = await put(file.name, file, { access: "public" });

  return Response.json({ url: blob.url });
}
