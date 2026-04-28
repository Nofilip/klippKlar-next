"use client";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Scissors } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import ServicesList from "./ServicesList";
import { ServiceDraft, ServiceInput, ServiceRow } from "@/types/type";
import { useState, useEffect } from "react";
import ServiceFormDialog from "./ServiceFormDialog";

type ViewState = "loading" | "error" | "empty" | "list";

export default function ServicePage() {
  const [selectedService, setSelectedService] = useState<ServiceDraft | null>(
    null,
  );
  const [services, setServices] = useState<ServiceDraft[]>([]);
  const [isEditOpen, setisEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const salonId = 1;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/treatments?salonId=${salonId}`);
        const data = await res.json();
        const rows = data.services;
        const mapped = rows.map((row: ServiceRow) => ({
          id: row.id,
          name_public: row.name,
          duration_min: row.duration_min,
          is_active: Boolean(row.is_active),
        }));
        setServices(mapped);
        setError(null);
      } catch {
        setError("Hämntning misslyckades");
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleEditOpenChange = (open: boolean) => {
    setisEditOpen(open);
    if (!open) setSelectedService(null);
  };

  const handleEdit = (service: ServiceDraft) => {
    setSelectedService(service);
    setisEditOpen(true);
    console.log("Parent: handleEdit körs", service.id);
  };

  async function handleDelete(service: ServiceDraft) {
    const ok = confirm(`Ta bort "${service.name_public}"?`);
    if (!ok) return;

    const res = await fetch(
      `/api/treatments/${service.id}?salonId=${salonId}`,
      {
        method: "DELETE",
      },
    );

    if (!res.ok) {
      alert("Kunde inte ta bort: " + (await res.text()));
      return;
    }

    setServices((prev) => prev.filter((s) => s.id !== service.id));

    if (selectedService?.id === service.id) {
      setisEditOpen(false);
      setSelectedService(null);
    }
  }

  function openNewForm() {
    console.log("Ny tjänst klickad");
    setSelectedService(null);
    setisEditOpen(true);
  }

  async function handleOnSave(data: ServiceInput) {
    if (selectedService) {
      const res = await fetch(
        `/api/treatments/${selectedService.id}?salonId=${salonId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!res.ok) {
        alert("Kunde inte spara ändringar: " + (await res.text()));
        return;
      }

      const json = await res.json();
      const row = json.service as ServiceRow;

      const updated: ServiceDraft = {
        id: row.id,
        name_public: row.name,
        duration_min: row.duration_min,
        is_active: Boolean(row.is_active),
      };

      setServices((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s)),
      );
    } else {
      // Spara i DB
      const res = await fetch(`/api/treatments?salonId=${salonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        alert("Kunde inte skapa tjänst: " + (await res.text()));
        return;
      }

      const json = await res.json();
      const row = json.service as ServiceRow; // {id,name,duration_min,is_active}

      const created: ServiceDraft = {
        id: row.id,
        name_public: row.name,
        duration_min: row.duration_min,
        is_active: Boolean(row.is_active),
      };

      setServices((prev) => [...prev, created]);
    }

    setisEditOpen(false);
    setSelectedService(null);
  }

  const view: ViewState = isLoading
    ? "loading"
    : error
      ? "error"
      : services.length === 0
        ? "empty"
        : "list";

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Tjänster"
        description="Hantera salongens tjänster"
        showBackButton
      >
        <Button onClick={openNewForm} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Ny tjänst
        </Button>
      </PageHeader>

      {view === "loading" && <LoadingState variant="list" rows={4} />}

      {view === "error" && (
        <ErrorState
          title="Kunde inte ladda tjänster"
          message={error ?? "Något gick fel vid hämtning."}
          onRetry={() => console.log("retry")}
        />
      )}

      {view === "empty" && (
        <EmptyState
          icon={Scissors}
          title="Inga tjänster ännu"
          description="Lägg till din första tjänst för att kunder ska kunna boka."
          action={
            <Button onClick={openNewForm}>
              <Plus className="w-4 h-4 mr-2" />
              Lägg till tjänst
            </Button>
          }
        />
      )}

      {view === "list" && (
        <ServicesList
          services={services}
          onEditClick={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ServiceFormDialog
        key={selectedService?.id ?? "new"}
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
        service={selectedService}
        onSave={handleOnSave}
      />
    </PageContainer>
  );
}
