import { db } from "@/db";
import { NextResponse } from "next/server";


type SalonRow = {
  id: number;
  name: string;
  slug: string;
  public_phone: string | null;
  elks_number: string | null;
  forward_to_number: string | null;
  phone_enabled: number;
};

const getSalonByElksNumber = db.prepare(`
  SELECT
    id,
    name,
    slug,
    public_phone,
    elks_number,
    forward_to_number,
    phone_enabled
  FROM salons
  WHERE elks_number = ?
  LIMIT 1
`);



export async function POST(req: Request) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);

  const callid = params.get("callid");
  const from = params.get("from");
  const to = params.get("to");
  const direction = params.get("direction");
  const created = params.get("created");

  console.log("46elks incoming call", {
    callid,
    from,
    to,
    direction,
    created,
  });

  if(!to) {
    return NextResponse.json( {hangup: true})
  }

  const salon = getSalonByElksNumber.get(to) as SalonRow | undefined;

    if (!salon) {
    console.log("Ingen salong hittades för nummer:", to);
    return NextResponse.json({ hangup: true });
  }

  if (salon.phone_enabled !== 1) {
    console.log("Telefoni är avstängd för salong:", salon.name);
    return NextResponse.json({ hangup: true });
  }

  if (!salon.forward_to_number) {
    console.log("Ingen vidarekoppling finns för salong:", salon.name);
    return NextResponse.json({ hangup: true });
  }

  console.log("Kopplar samtal till:", salon.forward_to_number);

  return NextResponse.json({
    connect: salon.forward_to_number,
  });
}