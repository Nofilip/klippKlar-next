import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";


export default function TjansterPage () {

 

    return (
      <PageContainer className="space-y-6">
        <PageHeader title="Hej!">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            Tjänster
          </div>

        </PageHeader>
      </PageContainer>
    )
}