"use client";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Scissors } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import ServicesList from "./ServicesList";
import { initialServices } from "./services.mock";
import { ServiceDraft, ServiceInput } from "@/types/type";
import { useState } from "react";
import ServiceFormDialog from "./ServiceFormDialog";

type ViewState = "loading" | "error" | "empty" | "list";

export default function ServicePage() {
  const [selectedService, setSelectedService] = useState<ServiceDraft | null>(
    null,
  );
  const [services, setServices] = useState<ServiceDraft[]>(initialServices);
  const [isEditOpen, setisEditOpen] = useState(false);

  const handleEditOpenChange = (open: boolean) => {
    setisEditOpen(open);
    if (!open) setSelectedService(null);
  };

  const isLoading = false;
  const error: string | null = null;

  const handleEdit = (service: ServiceDraft) => {
    setSelectedService(service);
    setisEditOpen(true);
    console.log("Parent: handleEdit körs", service.id);
  };

  function handleDelete(service: ServiceDraft) {
    const ok = confirm(`Ta bort "${service.name_public}"?`);
    if (!ok) return;

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

  function handleOnSave(data: ServiceInput) {
    if (selectedService) {
      setServices((prev) =>
        prev.map((s) => (s.id === selectedService.id ? { ...s, ...data } : s)),
      );
    } else {
      const newService: ServiceDraft = {
        id: Date.now(),
        ...data,
      };
      setServices((prev) => [...prev, newService]);
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
            <Button>
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
