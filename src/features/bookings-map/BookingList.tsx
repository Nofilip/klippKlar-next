import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DayRow } from "./dayRow";
import { bookings } from "./booking.mock";
import { Calendar } from "lucide-react";

type Props = {
  weekStart: Date; // måndag
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

const fmtDayNum = new Intl.DateTimeFormat("sv-SE", { day: "numeric" });
const fmtMonthShort = new Intl.DateTimeFormat("sv-SE", { month: "short" });
const fmtWeekdayShort = new Intl.DateTimeFormat("sv-SE", { weekday: "long" });

export function BookingList({ weekStart }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      dateKey: toISODateKey(date), // "YYYY-MM-DD"
      dayNum: fmtDayNum.format(date),
      monthShort: fmtMonthShort.format(date),
      label: fmtWeekdayShort.format(date), // mån, tis, ...
    };
  });
  const todayKey = toISODateKey(new Date());

  const weekStartKey = toISODateKey(weekStart);
  const weekEndKey = toISODateKey(addDays(weekStart, 6));

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
        const bookingsForDay = bookings.filter((b) => b.date === day.dateKey);

        const subtitle =
          bookingsForDay.length === 0
            ? "Inga bokningar"
            : `${bookingsForDay.length} bokningar`;

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
                subtitle={subtitle}
              />
            </AccordionTrigger>

            <AccordionContent className="pt-0 pb-4">
              <div className="p-6 text-sm text-muted-foreground flex flex-col items-center justify-center text-center gap-2">
                <Calendar className="h-5 w-5" />
                {bookingsForDay.length === 0 ? (
                  <p>Inga bokningar för {day.label}.</p>
                ) : (
                  <div className="w-full space-y-2">
                    {bookingsForDay.map((b) => (
                      <div
                        key={b.id ?? `${b.date}-${b.time}-${b.customer}`}
                        className="rounded-lg border bg-background p-3 text-left text-sm"
                      >
                        <div className="font-medium">
                          {b.time} • {b.customer}
                        </div>
                        <div className="text-muted-foreground">{b.service}</div>
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
