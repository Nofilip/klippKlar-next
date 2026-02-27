import { ServiceDraft } from "@/types/type";
import { MoreHorizontal, Pencil, Scissors, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ServicesList({
  services,
  onEditClick,
  onDelete,
}: {
  services: ServiceDraft[];
  onEditClick: (service: ServiceDraft) => void;
  onDelete: (service: ServiceDraft) => void;
}) {
  return (
    <div className="space-y-3">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex items-start justify-between gap-4 rounded-xl border bg-card p-4"
        >
          {/* LEFT: icon + text */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Scissors className="w-5 h-5 text-accent-foreground" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-foreground font-semibold truncate">
                  {service.name_public}
                </p>

                <StatusBadge
                  variant={service.is_active ? "active" : "inactive"}
                >
                  {service.is_active ? "Aktiv" : "Inaktiv"}
                </StatusBadge>
              </div>
              <p className="text-sm text-muted-foreground">
                {service.duration_min} minuter
              </p>
            </div>
          </div>

          {/* RIGHT: action */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Öppna meny"
              >
                <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  console.log("Child: jag klickade", service.id);
                  onEditClick(service);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Redigera
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete(service)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Ta bort
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
