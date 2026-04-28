"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  DayHours,
  DayOfWeek,
  WorkingHoursResponse,
  OpeningHoursRow,
} from "@/types/type";

const MIN_TIME = 7 * 60; // 07:00
const MAX_TIME = 22 * 60; // 22:00

const DAYS = [
  { value: 1, label: "Måndag", short: "Mån" },
  { value: 2, label: "Tisdag", short: "Tis" },
  { value: 3, label: "Onsdag", short: "Ons" },
  { value: 4, label: "Torsdag", short: "Tor" },
  { value: 5, label: "Fredag", short: "Fre" },
  { value: 6, label: "Lördag", short: "Lör" },
  { value: 7, label: "Söndag", short: "Sön" },
] as const;

function timeToMinutes(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

export default function OpeningHoursPage() {
  const [hours, setHours] = useState<DayHours[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/working-hours?salonId=1");

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Kunde inte hämta öppettider:", errorText);
        return;
      }

      const data: WorkingHoursResponse = await res.json();
      const mapped = data.hours.map((row: OpeningHoursRow) => ({
        day: row.day_of_week as DayOfWeek,
        isOpen: row.is_open === 1,
        start: row.start_time ?? "09:00",
        end: row.end_time ?? "17:00",
      }));
      setHours(mapped);
    }

    load();
  }, []);

  async function onSave() {
    const res = await fetch("/api/working-hours?salonId=1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours }),
    });

    if (!res.ok) {
      alert("Något gick fel: " + (await res.text()));
      return;
    }

    alert("Sparat!");
  }

  const hasErrors = hours.some((h) => {
    if (!h.isOpen) return false;

    const startMin = timeToMinutes(h.start);
    const endMin = timeToMinutes(h.end);

    return endMin <= startMin || startMin < MIN_TIME || endMin > MAX_TIME;
  });

  function updateHour(day: DayHours["day"], patch: Partial<DayHours>) {
    setHours((prev) =>
      prev.map((h) => (h.day === day ? { ...h, ...patch } : h)),
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Öppettider"
        description="Hantera salongens öppettider"
        showBackButton
      >
        <Button
          onClick={onSave}
          disabled={hasErrors}
          className="w-full md:w-auto"
        >
          <Save className="w-4 h-4 mr-2" />
          Spara
        </Button>
      </PageHeader>

      <div className="space-y-3">
        {hours.map((h) => {
          const day = DAYS.find((d) => d.value === h.day);
          const startMin = timeToMinutes(h.start);
          const endMin = timeToMinutes(h.end);

          const orderError = h.isOpen && endMin <= startMin;
          const rangeError =
            h.isOpen && (startMin < MIN_TIME || endMin > MAX_TIME);

          const timeError = orderError || rangeError;

          return (
            <Card
              key={h.day}
              className={[
                !h.isOpen ? "bg-muted/30" : "",
                timeError ? "border-red-500/50" : "",
              ].join(" ")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 shrink-0 font-medium">
                    {day?.short ?? "?"}
                  </div>

                  <Switch
                    checked={h.isOpen}
                    onCheckedChange={(checked) =>
                      updateHour(
                        h.day,
                        checked
                          ? { isOpen: true }
                          : { isOpen: false, start: "09:00", end: "17:00" },
                      )
                    }
                  />

                  <span className="hidden sm:inline text-sm text-muted-foreground w-14">
                    {h.isOpen ? "Öppet" : "Stängt"}
                  </span>

                  <div className="flex items-center gap-2 flex-1 justify-end">
                    {h.isOpen ? (
                      <>
                        <Input
                          type="time"
                          value={h.start}
                          onChange={(e) =>
                            updateHour(h.day, { start: e.target.value })
                          }
                          className="w-24 sm:w-28"
                        />
                        <span className="text-muted-foreground">–</span>
                        <Input
                          type="time"
                          value={h.end}
                          onChange={(e) =>
                            updateHour(h.day, { end: e.target.value })
                          }
                          className="w-24 sm:w-28"
                        />
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground italic text-right">
                        Stängt
                      </span>
                    )}
                  </div>

                  {timeError && (
                    <span className="text-xs text-red-500 ml-2 whitespace-nowrap">
                      {orderError
                        ? "Slut måste vara efter start"
                        : "Tider måste vara 07:00–22:00"}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
