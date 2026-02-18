import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Bokningar"
        description="Hantera alla bokningar för salongen."
        showBackButton
        stickyMobileCTA
      >
        <Button>Ny bokning</Button>
      </PageHeader>
    </PageContainer>
  );
}
