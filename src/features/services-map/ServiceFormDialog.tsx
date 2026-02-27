import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ServiceDraft, ServiceInput } from "@/types/type";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceDraft | null;
  onSave: (data: ServiceInput) => void;
};

export default function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  onSave,
}: Props) {
  const isEdit = service !== null;
  const [isActive, setIsActive] = useState(service?.is_active ?? true);
  const [namePublic, setNamePublic] = useState(service?.name_public ?? "");
  const [durationMin, setDurationMin] = useState(
    (service?.duration_min ?? 30).toString(),
  );

  const canSave = namePublic.trim().length > 0;

  function handleSave() {
    const duration = Number(durationMin);
    onSave({
      name_public: namePublic.trim(),
      duration_min: duration,
      is_active: isActive,
    });

    onOpenChange(false);
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Redigera tjänst" : "Ny tjänst"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Uppdatera tjänstens information."
                : "Lägg till en ny tjänst i salongen."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Namn */}
            <div className="space-y-2">
              <Label htmlFor="name_public">Namn (visas för kunder)</Label>
              <Input
                id="name_public"
                value={namePublic}
                onChange={(e) => setNamePublic(e.target.value)}
                placeholder="T.ex. Klippning herr"
              />
            </div>

            {/* Längd */}
            <div className="space-y-2">
              <Label htmlFor="duration_min">Längd</Label>
              <Select value={durationMin} onValueChange={setDurationMin}>
                <SelectTrigger id="duration_min">
                  <SelectValue placeholder="Välj längd" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minuter</SelectItem>
                  <SelectItem value="30">30 minuter</SelectItem>
                  <SelectItem value="60">60 minuter</SelectItem>
                  <SelectItem value="90">90 minuter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_active" className="cursor-pointer">
                  Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isActive
                    ? "Tjänsten kan bokas av kunder"
                    : "Tjänsten är dold"}
                </p>
              </div>

              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              {isEdit ? "Spara" : "Lägg till"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
