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

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export async function GET() {
  const now = new Date();
  const todayKey = toISODateKey(now);
  const nowTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

  // Först: försök hitta nästa idag från och med nuTime
  const todayNext = db
    .prepare(
      `
      SELECT
        a.id,
        a.date,
        a.time,
        a.status,
        a.customer_name,
        a.service_id,
        s.name AS service_name,
        s.duration_min
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      WHERE a.date = ?
        AND a.time >= ?
      ORDER BY a.time ASC
      LIMIT 1
      `
    )
    .get(todayKey, nowTime) as Row | undefined;

  if (todayNext) {
    return NextResponse.json({ next: todayNext });
  }

  // Annars: nästa framtida dag
  const nextFuture = db
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
      WHERE a.date > ?
      ORDER BY a.date ASC, a.time ASC
      LIMIT 1
      `
    )
    .get(todayKey) as Row | undefined;

  return NextResponse.json({ next: nextFuture ?? null });
}