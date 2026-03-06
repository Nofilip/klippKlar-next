"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookingList } from "./BookingList";
import { useState, useEffect } from "react";
import { toISODateKey } from "@/lib/date";
import type {
  AppointmentApiRow,
  OpeningHoursRow,
  WorkingHoursResponse,
} from "@/types/type";

type AppointmentsWeekResponse = {
  appointments: AppointmentApiRow[];
  start: string;
  end: string;
};

function startOfWeekMonday(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function BookingsPage() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeekMonday(new Date()),
  );

  const [appointments, setAppointments] = useState<AppointmentApiRow[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHoursRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekEnd = addDays(weekStart, 6);
  const weekStartKey = toISODateKey(weekStart);

  const fmt = new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
  });

  // Load appointments for week
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/appointments-week?start=${weekStartKey}`);
        if (!res.ok) throw new Error(await res.text());

        const data: AppointmentsWeekResponse = await res.json();
        setAppointments(data.appointments);
      } catch {
        setError("Kunde inte hämta bokningar.");
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [weekStartKey]);

  // Load opening hours once
  useEffect(() => {
    async function loadOpeningHours() {
      const res = await fetch("/api/working-hours");
      if (!res.ok) return;
      const data: WorkingHoursResponse = await res.json();
      setOpeningHours(data.hours);
    }
    loadOpeningHours();
  }, []);

  const bookedCount = appointments.length;
  const rangeText = `${fmt.format(weekStart)} – ${fmt.format(weekEnd)}`;
  const todayWeekStart = startOfWeekMonday(new Date());
  const isCurrentWeek = weekStart.getTime() === todayWeekStart.getTime();

  function prevWeek() {
    setWeekStart((prev) => addDays(prev, -7));
  }

  function nextWeek() {
    setWeekStart((prev) => addDays(prev, 7));
  }

  function goToday() {
    setWeekStart(startOfWeekMonday(new Date()));
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Bokningar"
        description="Veckoöversikt"
        showBackButton
      />

      {/* Row 1: controls (mobile centered) */}
      <div className="grid grid-cols-3 items-center">
        {/* Left: arrows */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Föregående vecka"
            onClick={prevWeek}
            className="hover:bg-orange-500/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            aria-label="Nästa vecka"
            onClick={nextWeek}
            className="hover:bg-orange-500/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Middle: today */}
        <div className="justify-self-center">
          <Button
            type="button"
            onClick={goToday}
            aria-pressed={isCurrentWeek}
            variant="ghost"
            className={[
              "border border-orange-500/20",
              "text-orange-500/80 hover:text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/50",
              isCurrentWeek ? "bg-orange-500/10 border-orange-500/60" : "",
            ].join(" ")}
          >
            Idag
          </Button>
        </div>

        {/* Right: booked */}
        <div className="justify-self-end">
          <Badge variant="secondary" className="text-xs">
            {rangeText}
          </Badge>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Laddar...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!isLoading && !error && (
        <BookingList
          weekStart={weekStart}
          appointments={appointments}
          openingHours={openingHours}
        />
      )}
    </PageContainer>
  );
}
