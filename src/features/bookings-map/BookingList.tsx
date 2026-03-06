import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DayRow } from "./dayRow";
import { Badge } from "@/components/ui/badge";
import { Calendar, Lock } from "lucide-react";
import type { AppointmentApiRow, OpeningHoursRow } from "@/types/type";

type Props = {
  weekStart: Date;
  appointments: AppointmentApiRow[];
  openingHours: OpeningHoursRow[];
};

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODateKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// JS getDay(): 0=sön..6=lör  -> DB: 0=mån..6=sön
function toDbDayIndex(date: Date): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const js = date.getDay();
  return (js === 0 ? 6 : js - 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

const fmtDayNum = new Intl.DateTimeFormat("sv-SE", { day: "numeric" });
const fmtMonthShort = new Intl.DateTimeFormat("sv-SE", { month: "short" });
const fmtWeekday = new Intl.DateTimeFormat("sv-SE", { weekday: "long" });

function capitalize(s: string) {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function statusLabel(status: string) {
  if (status === "booked") return "Bokad";
  if (status === "blocked") return "Blockerad";
  return status;
}

function statusVariant(
  status: string,
): "default" | "secondary" | "destructive" {
  if (status === "booked") return "default";
  if (status === "blocked") return "secondary";
  return "secondary";
}

export function BookingList({ weekStart, appointments, openingHours }: Props) {
  // Opening hours lookup: day_of_week -> isOpen
  const isOpenByDay = new Map<number, boolean>(
    openingHours.map((r) => [r.day_of_week, r.is_open === 1]),
  );

  // Group appointments by date once (avoid filtering 7x)
  const appointmentsByDate = new Map<string, AppointmentApiRow[]>();
  for (const a of appointments) {
    const list = appointmentsByDate.get(a.date) ?? [];
    list.push(a);
    appointmentsByDate.set(a.date, list);
  }

  // Build week days list once
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const isOpen = isOpenByDay.get(toDbDayIndex(date)) ?? true;

    return {
      dateKey: toISODateKey(date),
      dayNum: fmtDayNum.format(date),
      monthShort: fmtMonthShort.format(date),
      label: capitalize(fmtWeekday.format(date)),
      isOpen,
    };
  });

  const todayKey = toISODateKey(new Date());
  const weekStartKey = toISODateKey(weekStart);
  const weekEndKey = days[6]?.dateKey ?? toISODateKey(addDays(weekStart, 6));

  const isTodayInThisWeek = todayKey >= weekStartKey && todayKey <= weekEndKey;
  const defaultOpen = isTodayInThisWeek ? todayKey : undefined;

  return (
    <Accordion
      key={weekStartKey}
      type="single"
      collapsible
      defaultValue={defaultOpen}
      className="space-y-3"
    >
      {days.map((day) => {
        const isToday = isTodayInThisWeek && day.dateKey === todayKey;

        const appointmentsForDay = (appointmentsByDate.get(day.dateKey) ?? [])
          .slice()
          .sort((a, b) => a.time.localeCompare(b.time));

        const count = appointmentsForDay.length;

        // Only show badge (no subtitle text)
        const badgeText = !day.isOpen
          ? "STÄNGT"
          : count === 0
            ? null
            : count === 1
              ? "1 bokning"
              : `${count} bokningar`;

        return (
          <AccordionItem
            key={day.dateKey}
            value={day.dateKey}
            className={[
              "rounded-2xl border bg-card overflow-hidden transition",
              "hover:border-orange-500/40",
              isToday ? "border-orange-500/60 ring-1 ring-orange-500/20" : "",
            ].join(" ")}
          >
            <AccordionTrigger
              className={[
                "py-4 hover:no-underline transition",
                "hover:bg-orange-500/5",
                isToday ? "bg-orange-500/5" : "",
              ].join(" ")}
            >
              <DayRow
                dayNum={day.dayNum}
                monthShort={day.monthShort}
                dayLabel={day.label}
                subtitle=""
              />

              {badgeText && (
                <Badge
                  variant={!day.isOpen ? "secondary" : "default"}
                  className={[
                    "ml-auto mr-2 text-xs rounded-full px-3 py-1",
                    !day.isOpen ? "gap-1 font-semibold" : "",
                  ].join(" ")}
                >
                  {!day.isOpen && <Lock className="h-3 w-3" />}
                  {badgeText}
                </Badge>
              )}
            </AccordionTrigger>

            <AccordionContent className="pt-0 pb-4">
              <div className="p-6 text-sm text-muted-foreground flex flex-col items-center justify-center text-center gap-2">
                {appointmentsForDay.length === 0 ? (
                  <p>Inga bokningar för {day.label}.</p>
                ) : (
                  <div className="w-full space-y-2">
                    {appointmentsForDay.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-lg border bg-background p-3 text-left text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 shrink-0" />

                          <div className="min-w-0 flex-1 font-medium">
                            <span className="whitespace-nowrap">{a.time}</span>
                            <span className="text-muted-foreground"> • </span>
                            <span className="truncate">{a.service_name}</span>
                          </div>

                          <Badge
                            variant={statusVariant(a.status)}
                            className="text-xs shrink-0"
                          >
                            {statusLabel(a.status)}
                          </Badge>
                        </div>

                        <div className="mt-1 text-muted-foreground">
                          ({a.duration_min} min)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
