import { db } from "@/db";
import { NextResponse } from "next/server";
import type { ServiceRow, SalonRow, ServiceChoice } from "@/types/type";
import { getAvailableSlots } from "@/services/klippklar/getAvailableSlots";

/**
 * Ett knappval för tid i telefonflödet.
 * Exempel:
 * { digit: "1", time: "09:00" }
 */
type TimeChoice = {
  digit: string;
  time: string;
};

/**
 * Hämtar rätt salong utifrån vilket 46elks-nummer som ringts upp.
 * "to" från webhooken fungerar som tenant-nyckel.
 */
const getSalonByElksNumber = db.prepare(`
  SELECT
    id,
    name,
    slug,
    public_phone,
    elks_number,
    forward_to_number,
    phone_enabled,
    calendar_id
  FROM salons
  WHERE elks_number = ?
  LIMIT 1
`);

/**
 * Hämtar aktiva tjänster för en viss salong.
 * Bara tjänster med is_active = 1 ska kunna bokas via telefon.
 */
const getActiveServicesBySalonId = db.prepare(`
  SELECT
    id,
    salon_id,
    name,
    duration_min,
    is_active
  FROM services
  WHERE salon_id = ?
    AND is_active = 1
  ORDER BY id ASC
`);

/**
 * Skapar en ny bokning i appointments.
 * Vi sparar:
 * - date
 * - time
 * - service_id
 * - status
 * - created_at
 */
const createAppointment = db.prepare(`
  INSERT INTO appointments (date, time, service_id, status, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

/**
 * Bygger menytext för tjänsteval.
 * Exempel:
 * "Välj tjänst. Tryck 1 för Klippning Herr (30 min), 2 för Klippning + skägg (30 min)."
 */
function buildServiceMenuText(serviceChoices: ServiceChoice[]) {
  const options = serviceChoices.map((choice) => {
    return `${choice.digit} för ${choice.name} (${choice.durationMin} min)`;
  });

  return `Välj tjänst. Tryck ${options.join(", ")}. Tryck 9 för att avsluta.`;
}

/**
 * Hittar vald tjänst utifrån knapptryckning.
 */
function getServiceChoiceByDigit(
  serviceChoices: ServiceChoice[],
  digit: string
) {
  return serviceChoices.find((choice) => choice.digit === digit);
}

/**
 * Gör om riktiga slots från slot-logiken till knappval i telefonin.
 * Vi tar just nu bara de tre första tiderna.
 *
 * Exempel:
 * ["09:00", "09:30", "10:00"]
 * ->
 * [
 *   { digit: "1", time: "09:00" },
 *   { digit: "2", time: "09:30" },
 *   { digit: "3", time: "10:00" }
 * ]
 */
function buildTimeChoicesFromSlots(slots: string[]): TimeChoice[] {
  return slots.slice(0, 3).map((time, index) => {
    return {
      digit: String(index + 1),
      time,
    };
  });
}

/**
 * Bygger menytext för tidsval.
 */
function buildTimeMenuText(timeChoices: TimeChoice[], date: string) {
  const options = timeChoices.map((choice) => {
    return `${choice.digit} för ${choice.time}`;
  });

  return `Välj tid för ${date}. Tryck ${options.join(", ")}. Tryck 9 för att avsluta.`;
}

/**
 * Hittar vald tid utifrån knapptryckning.
 */
function getTimeChoiceByDigit(timeChoices: TimeChoice[], digit: string) {
  return timeChoices.find((choice) => choice.digit === digit);
}

/**
 * Gör om ett Date-objekt till YYYY-MM-DD.
 * Används för att fråga slot-logiken efter tider för dagens datum.
 */
function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Skapar timestamp för created_at i format:
 * YYYY-MM-DD HH:mm:ss
 */
function getCreatedAtTimestamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export async function POST(req: Request) {
  /**
   * 46elks skickar data som x-www-form-urlencoded.
   * Därför läser vi först body som text och gör om till URLSearchParams.
   */
  const raw = await req.text();
  const params = new URLSearchParams(raw);

  /**
   * Query params i URL:en styr vilket steg i IVR-flödet vi är i.
   * Exempel:
   * ?step=times&serviceId=1&salonId=1
   */
  const url = new URL(req.url);
  const step = url.searchParams.get("step");
  const serviceIdFromUrl = url.searchParams.get("serviceId");
  const salonIdFromUrl = url.searchParams.get("salonId");
  const dateFromUrl = url.searchParams.get("date");
  const timeFromUrl = url.searchParams.get("time");

  console.log("Raw body:", raw);
  console.log("All params:", Object.fromEntries(params.entries()));
  console.log("Step from URL:", step);
  console.log("serviceId from URL:", serviceIdFromUrl);
  console.log("salonId from URL:", salonIdFromUrl);
  console.log("date from URL:", dateFromUrl);
  console.log("time from URL:", timeFromUrl);

  /**
   * Dessa värden kommer från 46elks i POST-body.
   */
  const callid = params.get("callid");
  const from = params.get("from");
  const to = params.get("to");
  const direction = params.get("direction");
  const created = params.get("created");
  const pressedDigit = params.get("result");
  const why = params.get("why");

  console.log("46elks incoming call", {
    callid,
    from,
    to,
    direction,
    created,
    why,
  });

  /**
   * Om "to" saknas vet vi inte vilken salong som ringts upp.
   * Då avslutar vi.
   */
  if (!to) {
    return NextResponse.json({ hangup: true });
  }

  /**
   * Hitta rätt salong utifrån 46elks-numret.
   */
  const salon = getSalonByElksNumber.get(to) as SalonRow | undefined;

  if (!salon) {
    console.log("Ingen salong hittades för nummer:", to);
    return NextResponse.json({ hangup: true });
  }

  console.log("Salon calendar_id:", salon.calendar_id);

  /**
   * Om telefonin är avstängd för salongen ska samtalet avslutas.
   */
  if (salon.phone_enabled !== 1) {
    console.log("Telefoni är avstängd för salong:", salon.name);
    return NextResponse.json({ hangup: true });
  }

  /**
   * Den här kontrollen hade du sedan tidigare.
   * Vi låter den vara kvar nu eftersom den redan finns i ditt flöde.
   */
  if (!salon.calendar_id) {
    console.log("Ingen calendar_id finns för salong:", salon.name);
    return NextResponse.json({ hangup: true });
  }

  /**
   * Hämta salongens aktiva tjänster.
   */
  const services = getActiveServicesBySalonId.all(salon.id) as ServiceRow[];

  console.log("Services for salon:", services);

  if (services.length === 0) {
    console.log("Inga aktiva tjänster hittades för salong:", salon.name);
    return NextResponse.json({ hangup: true });
  }

  /**
   * Gör om tjänsterna till knappval i IVR-flödet.
   * Exempel:
   * tjänst 1 -> knapp "1"
   * tjänst 2 -> knapp "2"
   */
  const serviceChoices: ServiceChoice[] = services.map((service, index) => {
    return {
      digit: String(index + 1),
      serviceId: service.id,
      name: service.name,
      durationMin: service.duration_min,
    };
  });

  const menuText = buildServiceMenuText(serviceChoices);

  console.log("Menu text:", menuText);
  console.log("Service choices:", serviceChoices);
  console.log("46elks result:", pressedDigit, "why:", why);

  /**
   * STEG 1
   * Första inkommande samtalet:
   * spela upp tjänstemenyn.
   */
  if (!step && (!pressedDigit || pressedDigit === "newincoming")) {
    console.log("Skickar IVR-meny för nytt inkommande samtal.");

    return NextResponse.json({
      ivr: "https://scampishly-uncivilisable-magan.ngrok-free.dev/audio/welcome.mp3",
      digits: 1,
      timeout: 10,
      repeat: 3,
      next: "https://scampishly-uncivilisable-magan.ngrok-free.dev/api/elks/calls?step=service",
    });
  }

  /**
   * STEG 2
   * Användaren väljer tjänst.
   * Här går vi DIREKT vidare till tidsval.
   * Ingen bekräftelse här längre.
   */
  if (step === "service") {
    console.log("Pressed digit in service step:", pressedDigit);

    if (!pressedDigit) {
      return NextResponse.json({ hangup: true });
    }

   if (pressedDigit === "9") {
  return NextResponse.json({
    hangup: true,
  });
}


    const selectedChoice = getServiceChoiceByDigit(serviceChoices, pressedDigit);

    if (!selectedChoice) {
      console.log(
        "Ogiltigt val. Ingen tjänst matchar den tryckta siffran:",
        pressedDigit
      );
      return NextResponse.json({ hangup: true });
    }

    console.log(
      "Selected choice:",
      selectedChoice.name,
      "duration:",
      selectedChoice.durationMin,
      "minutes",
      "serviceId:",
      selectedChoice.serviceId
    );

    /**
     * Hämta tider direkt för vald tjänst.
     */
    const date = toIsoDate(new Date());

    const result = getAvailableSlots({
      date,
      serviceId: selectedChoice.serviceId,
      salonId: salon.id,
    });

    console.log("Available slots result after service selection:", result);

    const timeChoices = buildTimeChoicesFromSlots(result.slots);
    console.log("Time choices:", timeChoices);

   if (timeChoices.length === 0) {
  return NextResponse.json({
    hangup: true,
  });
}

    const timeMenuText = buildTimeMenuText(timeChoices, date);
    console.log("Time menu text:", timeMenuText);

    return NextResponse.json({
      ivr: "https://scampishly-uncivilisable-magan.ngrok-free.dev/audio/times.mp3",
      digits: 1,
      timeout: 10,
      repeat: 3,
      next: `https://scampishly-uncivilisable-magan.ngrok-free.dev/api/elks/calls?step=times&serviceId=${selectedChoice.serviceId}&salonId=${salon.id}&date=${date}`,
    });
  }

  /**
   * STEG 3
   * Användaren väljer tid.
   * Här går vi vidare till SLUTBEKRÄFTELSE.
   */
  if (step === "times") {
  console.log("Pressed digit for time selection:", pressedDigit);

  if (!serviceIdFromUrl || !salonIdFromUrl || !dateFromUrl) {
    console.log("Saknar serviceId, salonId eller date i times-steget");
    return NextResponse.json({ hangup: true });
  }

  const numericServiceId = Number(serviceIdFromUrl);
  const numericSalonId = Number(salonIdFromUrl);

  if (
    !Number.isFinite(numericServiceId) ||
    !Number.isFinite(numericSalonId)
  ) {
    console.log("Ogiltigt serviceId eller salonId i times-steget");
    return NextResponse.json({ hangup: true });
  }

  if (!pressedDigit) {
    console.log("Ingen siffra mottagen i times-steget");
    return NextResponse.json({ hangup: true });
  }

      if (pressedDigit === "9") {
  return NextResponse.json({ hangup: true });
}

  /**
   * Hämta riktiga lediga tider igen för att mappa knappvalet korrekt.
   */
  const result = getAvailableSlots({
    date: dateFromUrl,
    serviceId: numericServiceId,
    salonId: numericSalonId,
  });

  console.log("Available slots result in times step:", result);

  const timeChoices = buildTimeChoicesFromSlots(result.slots);
  console.log("Time choices in times step:", timeChoices);

    if (timeChoices.length === 0) {
  return NextResponse.json({
    hangup: true,
  });
}

  /**
   * Översätt knapptrycket till en faktisk tid.
   */
  const selectedTime = getTimeChoiceByDigit(timeChoices, pressedDigit);

  if (!selectedTime) {
    console.log("Ogiltigt tidsval:", pressedDigit);
    return NextResponse.json({ hangup: true });
  }

  console.log(
    "Tid vald:",
    selectedTime.time,
    "för serviceId:",
    numericServiceId,
    "salonId:",
    numericSalonId,
    "date:",
    dateFromUrl
  );

  /**
   * Här skapar vi INTE bokningen ännu.
   * Vi går vidare till slutbekräftelse.
   */
  return NextResponse.json({
    ivr: "https://scampishly-uncivilisable-magan.ngrok-free.dev/audio/final-confirm.mp3",
    digits: 1,
    timeout: 10,
    repeat: 3,
    next: `https://scampishly-uncivilisable-magan.ngrok-free.dev/api/elks/calls?step=final-confirm&serviceId=${numericServiceId}&salonId=${numericSalonId}&date=${dateFromUrl}&time=${selectedTime.time}`,
  });
}

  /**
   * STEG 4
   * Slutbekräftelse.
   *
   * 1 = skapa bokning
   * 0 = avbryt
   */
  if (step === "final-confirm") {
  console.log("Pressed digit for final confirmation:", pressedDigit);

  if (!serviceIdFromUrl || !salonIdFromUrl || !dateFromUrl || !timeFromUrl) {
    console.log("Saknar serviceId, salonId, date eller time i final-confirm");
    return NextResponse.json({ hangup: true });
  }

  const numericServiceId = Number(serviceIdFromUrl);
  const numericSalonId = Number(salonIdFromUrl);

  if (
    !Number.isFinite(numericServiceId) ||
    !Number.isFinite(numericSalonId)
  ) {
    console.log("Ogiltigt serviceId eller salonId i final-confirm");
    return NextResponse.json({ hangup: true });
  }

  if (pressedDigit === "0") {
    console.log("Användaren avbröt i final-confirm");
    return NextResponse.json({
    hangup: true,
  });
  }


  if (pressedDigit !== "1") {
    console.log("Ogiltigt val i final-confirm:", pressedDigit);
    return NextResponse.json({ hangup: true });
  }

  const createdAt = getCreatedAtTimestamp();

  const insertResult = createAppointment.run(
    dateFromUrl,
    timeFromUrl,
    numericServiceId,
    "booked",
    createdAt
  );

  console.log("Appointment created:", insertResult);

  return NextResponse.json({
    play: "https://scampishly-uncivilisable-magan.ngrok-free.dev/audio/thank-you.mp3",
  });
}

  /**
   * Fallback:
   * om inget steg matchar avslutar vi samtalet.
   */
  return NextResponse.json({ hangup: true });
}