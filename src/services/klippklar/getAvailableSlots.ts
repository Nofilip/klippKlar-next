import { db } from "@/db";
import type { OpeningHoursRow } from "@/types/type";

type GetAvailableSlotsInput = {
  date: string;
  serviceId: number;
  salonId: number;
};

type ServiceDurationRow = {
  id: number;
  salon_id: number;
  duration_min: number;
};

type AppointmentRow = {
  id: number;
  date: string;
  time: string;
  duration_min: number;
};

function getDayOfWeekFromIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function overlaps(
  slotStart: number,
  slotEnd: number,
  bookingStart: number,
  bookingEnd: number
) {
  return slotStart < bookingEnd && slotEnd > bookingStart;
}

export function getAvailableSlots({
  date,
  serviceId,
  salonId,
}: GetAvailableSlotsInput) {
  const dayOfWeek = getDayOfWeekFromIsoDate(date);

  const openingHours = db
    .prepare(
      `
      SELECT salon_id, day_of_week, is_open, start_time, end_time
      FROM opening_hours
      WHERE salon_id = ?
        AND day_of_week = ?
      LIMIT 1
      `
    )
    .get(salonId, dayOfWeek) as OpeningHoursRow | undefined;

  if (!openingHours) {
    return { slots: [], durationMin: null };
  }

  if (
    openingHours.is_open !== 1 ||
    !openingHours.start_time ||
    !openingHours.end_time
  ) {
    return { slots: [], durationMin: null };
  }

  const service = db
    .prepare(
      `
      SELECT id, salon_id, duration_min
      FROM services
      WHERE id = ?
        AND salon_id = ?
      LIMIT 1
      `
    )
    .get(serviceId, salonId) as ServiceDurationRow | undefined;

  if (!service) {
    throw new Error("Service not found");
  }

  const appointments = db
    .prepare(
      `
      SELECT
        a.id,
        a.date,
        a.time,
        s.duration_min
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      WHERE a.date = ?
        AND s.salon_id = ?
        AND a.status != 'cancelled'
      ORDER BY a.time ASC
      `
    )
    .all(date, salonId) as AppointmentRow[];

  const openMinutes = timeToMinutes(openingHours.start_time);
  const closeMinutes = timeToMinutes(openingHours.end_time);
  const serviceDuration = service.duration_min;

  const slots: string[] = [];

  for (
    let slotStart = openMinutes;
    slotStart + serviceDuration <= closeMinutes;
    slotStart += 30
  ) {
    const slotEnd = slotStart + serviceDuration;

    const collides = appointments.some((appointment) => {
      const bookingStart = timeToMinutes(appointment.time);
      const bookingEnd = bookingStart + appointment.duration_min;

      return overlaps(slotStart, slotEnd, bookingStart, bookingEnd);
    });

    if (!collides) {
      slots.push(minutesToTime(slotStart));
    }
  }

  return {
    slots,
    durationMin: serviceDuration,
  };
}