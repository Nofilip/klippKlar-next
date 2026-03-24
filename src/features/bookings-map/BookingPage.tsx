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
  ServiceRow,
} from "@/types/type";

type AppointmentsWeekResponse = {
  appointments: AppointmentApiRow[];
  start: string;
  end: string;
};

type TreatmentsResponse = {
  services: ServiceRow[];
};

type AvailableSlotsResponse = {
  date: string;
  serviceId: number;
  durationMin: number;
  slots: string[];
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
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Temporary available-slots test state
  const [selectedServiceId, setSelectedServiceId] = useState("1");
  const [selectedDate, setSelectedDate] = useState(toISODateKey(new Date()));
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const weekEnd = addDays(weekStart, 6);
  const weekStartKey = toISODateKey(weekStart);
  const salonId = 1;

  const fmt = new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
  });

  useEffect(() => {
    async function loadServices() {
      try {
        setServicesError(null);

        const res = await fetch(`/api/treatments?salonId=${salonId}`);
        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data: TreatmentsResponse = await res.json();
        const rows = data.services;

        setServices(rows);

        if (rows.length > 0) {
          setSelectedServiceId(String(rows[0].id));
        }
      } catch {
        setServicesError("Kunde inte hämta tjänster.");
        setServices([]);
      }
    }

    loadServices();
  }, []);

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

  useEffect(() => {
    async function loadOpeningHours() {
      const res = await fetch(`/api/working-hours?salonId=${salonId}`);
      if (!res.ok) return;
      const data: WorkingHoursResponse = await res.json();
      setOpeningHours(data.hours);
    }

    loadOpeningHours();
  }, []);

  useEffect(() => {
    async function autoLoadAvailableSlots() {
      const serviceId = Number(selectedServiceId);

      if (!serviceId || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      try {
        setSlotsLoading(true);
        setSlotsError(null);
        setAvailableSlots([]);

        const res = await fetch(
          `/api/available-slots?date=${selectedDate}&serviceId=${serviceId}&salonId=${salonId}`,
        );
        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data: AvailableSlotsResponse = await res.json();
        setAvailableSlots(data.slots);
      } catch {
        setSlotsError("Kunde inte hämta lediga tider.");
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }

    autoLoadAvailableSlots();
  }, [selectedServiceId, selectedDate]);

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

      <div className="grid grid-cols-3 items-center">
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

      {/* Temporary test panel for available slots */}
      <section className="rounded-xl border bg-card p-4 space-y-4">
        <div>
          <div>
            <h2 className="text-lg font-semibold">Tillgängliga tider</h2>
            <p className="text-sm text-muted-foreground">
              Välj tjänst och datum för att se lediga tider.
            </p>
            {servicesError && (
              <p className="text-sm text-red-500">{servicesError}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="serviceId" className="text-sm font-medium">
              Tjänst
            </label>
            <select
              id="serviceId"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {services.length === 0 && (
                <option value="">Inga tjänster hittades</option>
              )}

              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration_min} min)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="selectedDate" className="text-sm font-medium">
              Datum
            </label>
            <input
              id="selectedDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        {slotsLoading && (
          <p className="text-sm text-muted-foreground">Hämtar tider...</p>
        )}

        {slotsError && <p className="text-sm text-red-500">{slotsError}</p>}

        {!slotsLoading && !slotsError && availableSlots.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableSlots.map((slot) => (
              <div
                key={slot}
                className="rounded-lg border px-3 py-2 text-sm font-medium bg-background"
              >
                {slot}
              </div>
            ))}
          </div>
        )}

        {!slotsLoading && !slotsError && availableSlots.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Det finns inga lediga tider för valt datum.
          </p>
        )}
      </section>
    </PageContainer>
  );
}
