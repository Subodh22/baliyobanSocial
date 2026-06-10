import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { provider } = (await req.json()) as { provider: string };
  if (!provider) return Response.json({ error: "provider is required" }, { status: 400 });

  const deleted = await prisma.account.deleteMany({
    where: { userId, provider },
  });

  return Response.json({ ok: true, deleted: deleted.count });
}
