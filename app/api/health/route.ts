import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Diagnostic endpoint — reports whether the DB env is set and whether the
// expected tables exist. Visit /api/health to see the JSON. No auth required.
export async function GET() {
  const url = process.env.TURSO_DATABASE_URL;
  // Which optional provider/feature env vars are configured (booleans only —
  // never the values). Helps spot a missing secret after a deploy.
  const configured = (names: string[]) =>
    Object.fromEntries(names.map((n) => [n, Boolean(process.env[n])]));
  const report: Record<string, unknown> = {
    tursoUrlSet: Boolean(url),
    tursoUrlScheme: url ? url.split(":")[0] : null,
    tursoTokenSet: Boolean(process.env.TURSO_AUTH_TOKEN),
    clerkSecretSet: Boolean(process.env.CLERK_SECRET_KEY),
    clerkPublishableSet: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    providers: configured([
      "AUTH_TWITTER_ID",
      "AUTH_FACEBOOK_ID",
      "AUTH_INSTAGRAM_ID",
      "AUTH_LINKEDIN_ID",
      "AUTH_TIKTOK_ID",
      "AUTH_GOOGLE_ID",
      "SLACK_CLIENT_ID",
    ]),
    features: configured(["CRON_SECRET", "BLOB_READ_WRITE_TOKEN", "NEXTAUTH_URL"]),
  };

  try {
    const rows = await prisma.$queryRawUnsafe<{ name: string }[]>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    report.dbConnected = true;
    report.tables = rows.map((r) => r.name);
  } catch (e) {
    report.dbConnected = false;
    report.error = e instanceof Error ? e.message : String(e);
  }

  return Response.json(report, { status: report.dbConnected ? 200 : 500 });
}
