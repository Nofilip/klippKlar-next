import { db } from "@/db/index";
import type { DayHours } from "@/types/type";

export const runtime = "nodejs";
type PutBody = { hours: DayHours[] };

/// Hämta veckodagar/tider
export async function GET() {
    const openingHoursFromDb = db.prepare (
      "SELECT day_of_week, is_open, start_time, end_time FROM opening_hours ORDER BY day_of_week ASC"
    ).all()
    return Response.json({hours: openingHoursFromDb})
  
}


///Uppdatera veckodagar/tider


export async function PUT(req: Request) {
  const body = (await req.json()) as PutBody;

  if (!body?.hours || !Array.isArray(body.hours)) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const update = db.prepare(`
    UPDATE opening_hours
    SET is_open = ?, start_time = ?, end_time = ?
    WHERE day_of_week = ?
  `);

  const tx = db.transaction((hours: DayHours[]) => {
    for (const h of hours) {
      const isOpenInt = h.isOpen ? 1 : 0;

      // om stängt -> null i DB
      const start = h.isOpen ? h.start : null;
      const end = h.isOpen ? h.end : null;

      update.run(isOpenInt, start, end, h.day);
    }
  });

  tx(body.hours);

  return Response.json({ ok: true });
}