import { db } from "@/db/index";

export const runtime = "nodejs";

export async function GET() {
  const row = db.prepare("SELECT 1 as ok").get();
  return Response.json(row);
}