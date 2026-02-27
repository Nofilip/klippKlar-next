type Props = {
  dayNum: string;
  monthShort: string;
  dayLabel: string;
  subtitle: string;
};

export function DayRow({ dayNum, monthShort, dayLabel, subtitle }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-14 shrink-0 rounded-xl bg-muted/50 px-2 py-2 text-center">
        <div className="text-lg font-semibold leading-none">{dayNum}</div>
        <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {monthShort}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-base font-semibold">{dayLabel}</div>
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  );
}
