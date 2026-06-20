import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// Keep a Prisma `User` row in sync with the signed-in Clerk user, so that
// `Post` (and `Account`) foreign keys to User.id stay valid. Call this from
// any authenticated route before reading/writing user-scoped data.
export async function ensureUser() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress ?? null;
  const name = user.fullName ?? user.firstName ?? null;
  const image = user.imageUrl ?? null;

  // Try a fast read first; only upsert if the row is missing or stale.
  const existing = await prisma.user.findUnique({ where: { id: user.id } });

  if (!existing || existing.email !== email || existing.name !== name || existing.image !== image) {
    // If a stale User row holds the same email (e.g. the user re-registered
    // with a new Clerk ID), clear it first to avoid a UNIQUE constraint error.
    if (email && !existing) {
      await prisma.user.updateMany({
        where: { email, id: { not: user.id } },
        data: { email: null },
      });
    }

    await prisma.user.upsert({
      where: { id: user.id },
      update: { email, name, image },
      create: { id: user.id, email, name, image },
    });
  }

  return { id: user.id, email, name, image };
}
