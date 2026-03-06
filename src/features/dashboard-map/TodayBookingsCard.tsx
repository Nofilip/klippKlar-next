"use client";

import { useEffect, useState } from "react";

type Appointment = {
  id: number;
  date: string;
  time: string;
  status: string;
  service_name: string;
  duration_min: number | null;
};

type ViewState = "loading" | "error" | "ready";

export default function TodayBookingsCard() {
  const [state, setState] = useState<ViewState>("loading");
  const [error, setError] = useState<string | null>(null);

  const [today, setToday] = useState<Appointment[]>([]);
  const [next, setNext] = useState<Appointment | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setState("loading");
        setError(null);

        // 1) Hämta dagens
        const resToday = await fetch("/api/dashboard/appointments/today", {
          cache: "no-store",
        });
        if (!resToday.ok) throw new Error(`today HTTP ${resToday.status}`);

        const dataToday = (await resToday.json()) as { today: Appointment[] };
        if (!alive) return;

        const todayList = dataToday.today ?? [];
        setToday(todayList);

        // 2) Om inga idag → hämta next
        if (todayList.length === 0) {
          const resNext = await fetch("/api/dashboard/appointments/next", {
            cache: "no-store",
          });
          if (!resNext.ok) throw new Error(`next HTTP ${resNext.status}`);

          const dataNext = (await resNext.json()) as {
            next: Appointment | null;
          };
          if (!alive) return;

          setNext(dataNext.next ?? null);
        } else {
          setNext(null);
        }

        setState("ready");
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Okänt fel");
        setState("error");
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  if (state === "loading") {
    return <p className="text-sm text-muted-foreground">Laddar…</p>;
  }

  if (state === "error") {
    return (
      <p className="text-sm text-muted-foreground">
        Kunde inte hämta bokningar. ({error})
      </p>
    );
  }

  // CASE: finns idag
  if (today.length > 0) {
    const visible = today.slice(0, 3);
    const remaining = Math.max(0, today.length - visible.length);

    return (
      <div className="space-y-2">
        {visible.map((b) => (
          <div key={b.id} className="rounded-lg border bg-background p-3">
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={[
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                  "border border-orange-500/25 bg-orange-500/10 text-orange-500/90",
                ].join(" ")}
                title="Tjänst"
              >
                {b.service_name}
              </span>

              {b.duration_min ? (
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                    "border border-orange-500/15 bg-orange-500/5 text-orange-500/80",
                  ].join(" ")}
                  title="Längd"
                >
                  {b.duration_min} min
                </span>
              ) : null}
            </div>
          </div>
        ))}

        {remaining > 0 && (
          <p className="text-xs text-muted-foreground">
            +{remaining} till idag
          </p>
        )}
      </div>
    );
  }

  // CASE: inga idag, men nästa finns
  if (next) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Inga bokningar idag.</p>

        <div className="rounded-lg border bg-background p-3">
          <div className="text-xs text-muted-foreground">Nästa bokning</div>
          <div className="font-medium">
            {next.date} • {next.time}
          </div>
          <div className="text-sm text-muted-foreground">
            {next.service_name}
            {next.duration_min ? ` • ${next.duration_min} min` : ""}
          </div>
        </div>
      </div>
    );
  }

  // CASE: ingenting alls
  return (
    <p className="text-sm text-muted-foreground">Inga bokningar just nu.</p>
  );
}
