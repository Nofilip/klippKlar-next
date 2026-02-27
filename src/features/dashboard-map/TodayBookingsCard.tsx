import { toISODateKey } from "@/lib/date";
import { bookings } from "../bookings-map/booking.mock";

export default function TodayBookingsCard() {
  const todayKey = toISODateKey(new Date());

  const todayAll = bookings
    .filter((b) => b.date === todayKey)
    .sort((a, b) => a.time.localeCompare(b.time));

  const visible = todayAll.slice(0, 3);
  const remaining = todayAll.length - visible.length;

  if (todayAll.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Inga bokningar idag.</p>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((b) => (
        <div key={b.id} className="rounded-lg border bg-background p-3">
          <div className="font-medium">
            {b.time} • {b.customer}
          </div>
          <div className="text-sm text-muted-foreground">{b.service}</div>
        </div>
      ))}

      {remaining > 0 && (
        <p className="text-xs text-muted-foreground">+{remaining} till idag</p>
      )}
    </div>
  );
}
