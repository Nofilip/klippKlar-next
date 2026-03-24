import { getAvailableSlots } from "@/services/klippklar/getAvailableSlots";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const serviceId = url.searchParams.get("serviceId");
  const salonId = url.searchParams.get("salonId");

  if (!date || !serviceId || !salonId) {
    return Response.json(
      { error: "Missing date, serviceId or salonId" },
      { status: 400 }
    );
  }

  const numericServiceId = Number(serviceId);
  const numericSalonId = Number(salonId);

  if (!Number.isFinite(numericServiceId) || !Number.isFinite(numericSalonId)) {
    return Response.json(
      { error: "Invalid serviceId or salonId" },
      { status: 400 }
    );
  }

  try {
    const result = getAvailableSlots({
      date,
      serviceId: numericServiceId,
      salonId: numericSalonId,
    });

    return Response.json({
      date,
      serviceId: numericServiceId,
      salonId: numericSalonId,
      durationMin: result.durationMin,
      slots: result.slots,
    });
  } catch (error) {
    console.error("available-slots error:", error);

    return Response.json(
      { error: "Failed to get available slots" },
      { status: 500 }
    );
  }
}