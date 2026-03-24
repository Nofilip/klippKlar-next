import { db } from "@/db/index";

export const runtime = "nodejs";

type PostBody = {
  name_public: string;
  duration_min: number;
  is_active: boolean;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const salonId = url.searchParams.get("salonId");

  if (!salonId) {
    return Response.json({ error: "Missing salonId" }, { status: 400 });
  }

  const numericSalonId = Number(salonId);

  if (!Number.isFinite(numericSalonId)) {
    return Response.json({ error: "Invalid salonId" }, { status: 400 });
  }

  const treatmentsFromDb = db
    .prepare(
      `
      SELECT id, salon_id, name, duration_min, is_active
      FROM services
      WHERE salon_id = ?
      ORDER BY id ASC
      `,
    )
    .all(numericSalonId);

  return Response.json({ services: treatmentsFromDb });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const salonId = url.searchParams.get("salonId");

  if (!salonId) {
    return Response.json({ error: "Missing salonId" }, { status: 400 });
  }

  const numericSalonId = Number(salonId);

  if (!Number.isFinite(numericSalonId)) {
    return Response.json({ error: "Invalid salonId" }, { status: 400 });
  }

  const body = (await req.json()) as PostBody;

  if (!body?.name_public || typeof body.name_public !== "string") {
    return Response.json({ error: "name_public required" }, { status: 400 });
  }

  const duration = Number(body.duration_min);

  if (!Number.isFinite(duration) || duration <= 0) {
    return Response.json({ error: "duration_min invalid" }, { status: 400 });
  }

  const insert = db.prepare(`
    INSERT INTO services (salon_id, name, duration_min, is_active)
    VALUES (?, ?, ?, ?)
  `);

  const result = insert.run(
    numericSalonId,
    body.name_public.trim(),
    duration,
    body.is_active ? 1 : 0,
  );

  const created = db
    .prepare(
      `
      SELECT id, salon_id, name, duration_min, is_active
      FROM services
      WHERE id = ? AND salon_id = ?
      `,
    )
    .get(result.lastInsertRowid, numericSalonId);

  return Response.json({ service: created }, { status: 201 });
}