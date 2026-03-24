import { db } from "@/db/index";
import type { DayHours, OpeningHoursRow } from "@/types/type";

export const runtime = "nodejs";

type PutBody = { hours: DayHours[] };

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

  const openingHoursFromDb = db
    .prepare(
      `
      SELECT salon_id, day_of_week, is_open, start_time, end_time
      FROM opening_hours
      WHERE salon_id = ?
      ORDER BY day_of_week ASC
      `,
    )
    .all(numericSalonId) as OpeningHoursRow[];

  return Response.json({ hours: openingHoursFromDb });
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const salonId = url.searchParams.get("salonId");

  if (!salonId) {
    return Response.json({ error: "Missing salonId" }, { status: 400 });
  }

  const numericSalonId = Number(salonId);

  if (!Number.isFinite(numericSalonId)) {
    return Response.json({ error: "Invalid salonId" }, { status: 400 });
  }

  const body = (await req.json()) as PutBody;

  if (!body?.hours || !Array.isArray(body.hours)) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const update = db.prepare(`
    UPDATE opening_hours
    SET is_open = ?, start_time = ?, end_time = ?
    WHERE salon_id = ? AND day_of_week = ?
  `);

  const tx = db.transaction((hours: DayHours[]) => {
    for (const h of hours) {
      const isOpenInt = h.isOpen ? 1 : 0;
      const start = h.isOpen ? h.start : null;
      const end = h.isOpen ? h.end : null;

      update.run(isOpenInt, start, end, numericSalonId, h.day);
    }
  });

  tx(body.hours);

  return Response.json({ ok: true });
}