import { db } from "@/db/index";

export const runtime = "nodejs";

export async function GET() {
   const treatmentsFromDb = db.prepare (
    "SELECT id, name, duration_min, is_active FROM services ORDER BY id ASC"
   ).all()
    return Response.json({ services: treatmentsFromDb })
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name_public: string;
    duration_min: number;
    is_active: boolean;
  };

  // minimal validering
  if (!body?.name_public || typeof body.name_public !== "string") {
    return Response.json({ error: "name_public required" }, { status: 400 });
  }
  const duration = Number(body.duration_min);
  if (!Number.isFinite(duration) || duration <= 0) {
    return Response.json({ error: "duration_min invalid" }, { status: 400 });
  }

  const insert = db.prepare(`
    INSERT INTO services (name, duration_min, is_active)
    VALUES (?, ?, ?)
  `);

  const result = insert.run(
    body.name_public.trim(),
    duration,
    body.is_active ? 1 : 0,
  );

  // returnera ny rad (så UI får id + DB-format)
  const created = db
    .prepare(`SELECT id, name, duration_min, is_active FROM services WHERE id = ?`)
    .get(result.lastInsertRowid);

  return Response.json({ service: created }, { status: 201 });
}