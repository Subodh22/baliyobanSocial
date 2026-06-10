import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// Keep a Prisma `User` row in sync with the signed-in Clerk user, so that
// `Post` (and `Account`) foreign keys to User.id stay valid. Call this from
// any authenticated route before reading/writing user-scoped data.
//
// Wrapped with React.cache so multiple calls within the same request
// (e.g. layout + page) are deduplicated into a single Clerk + DB round-trip.
export const ensureUser = cache(async () => {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress ?? null;
  const name = user.fullName ?? user.firstName ?? null;
  const image = user.imageUrl ?? null;

  // Single upsert — always idempotent, avoids the extra findUnique read.
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email, name, image },
    create: { id: user.id, email, name, image },
  });

  return { id: user.id, email, name, image };
});
