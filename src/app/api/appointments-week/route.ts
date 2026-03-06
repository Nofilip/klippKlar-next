import { db } from "@/db";

export const runtime = "nodejs";

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const start = url.searchParams.get("start");

  if (!start) {
    return Response.json({ error: "Missing start" }, { status: 400 });
  }

  const end = addDays(start, 6);

  const rows = db
    .prepare(
      `
      SELECT 
        a.id,
        a.date,
        a.time,
        a.service_id,
        s.name AS service_name,
        s.duration_min AS duration_min,
        a.status,
        a.created_at
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      WHERE a.date >= ? AND a.date <= ?
      ORDER BY a.date ASC, a.time ASC
    `,
    )
    .all(start, end);

  return Response.json({ appointments: rows, start, end });
}