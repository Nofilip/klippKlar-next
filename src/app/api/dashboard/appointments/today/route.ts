import { NextResponse } from "next/server";
import { db } from "@/db"; 
import { toISODateKey } from "@/lib/date";

type Row = {
  id: number;
  date: string;
  time: string;
  status: string;
  customer_name: string | null;
  service_id: number;
  service_name: string;
  duration_min: number | null;
};

export async function GET() {
  const todayKey = toISODateKey(new Date());

  const rows = db
    .prepare(
      `
      SELECT
        a.id,
        a.date,
        a.time,
        a.status,
        a.service_id,
        s.name AS service_name,
        s.duration_min
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      WHERE a.date = ?
      ORDER BY a.time ASC
      `
    )
    .all(todayKey) as Row[];

  return NextResponse.json({ today: rows, todayKey });
}