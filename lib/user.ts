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

  await prisma.user.upsert({
    where: { id: user.id },
    update: { email, name, image },
    create: { id: user.id, email, name, image },
  });

  return { id: user.id, email, name, image };
}
