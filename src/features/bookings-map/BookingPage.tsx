"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookingList } from "./BookingList";
import { useState } from "react";

function startOfWeekMonday(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // flytta till måndag
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
  const weekEnd = addDays(weekStart, 6);
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
  });
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
      <PageHeader title="Bokningar" description="Veckoöversikt" showBackButton>
        <Button>Ny bokning</Button>
      </PageHeader>

      {/* Week navigation row (statisk) */}
      <div
        className={[
          "flex items-center justify-between gap-3 rounded-xl border bg-card p-4 transition",
          isCurrentWeek ? "ring-1 ring-orange-500/30 border-orange-500/30" : "",
        ].join(" ")}
      >
        <div className="flex items-center gap-2">
          <Button
            className="cursor-pointer transition hover:bg-orange-500/10"
            variant="outline"
            size="icon"
            aria-label="Föregående vecka"
            onClick={prevWeek}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            className="cursor-pointer transition hover:bg-orange-500/10"
            variant="outline"
            size="icon"
            aria-label="Nästa vecka"
            onClick={nextWeek}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            onClick={goToday}
            aria-pressed={isCurrentWeek}
            variant="ghost"
            className={[
              "cursor-pointer transition",
              // border-bas
              "border border-orange-500/20",
              // färg + hover
              "text-orange-500/70 hover:text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/50",
              // aktivt läge
              isCurrentWeek
                ? "text-orange-500 bg-orange-500/10 border-orange-500/60"
                : "",
              // fokus
              "focus-visible:ring-2 focus-visible:ring-orange-500/40",
            ].join(" ")}
          >
            Idag
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium">{rangeText}</span>
          {isCurrentWeek && <Badge className="text-xs">Denna vecka</Badge>}
          <Badge variant="secondary" className="text-xs">
            0 bokade
          </Badge>
        </div>
      </div>
      <BookingList weekStart={weekStart} />
    </PageContainer>
  );
}
