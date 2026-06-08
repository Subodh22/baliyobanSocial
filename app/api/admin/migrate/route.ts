import { auth } from "@clerk/nextjs/server";
import { migrateDatabase } from "@/lib/migrate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One-time setup endpoint: creates the tables in the Turso database this
// deployment is connected to. Gated behind sign-in and idempotent.
// Visit /api/admin/migrate once while signed in.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in first, then visit this URL." }, { status: 401 });
  }

  try {
    const tables = await migrateDatabase();
    return Response.json({
      ok: true,
      message: "Tables created. You can now use the dashboard.",
      tables,
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
