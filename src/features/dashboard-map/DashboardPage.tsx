import Link from "next/link";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Calendar, Scissors, Clock, ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TodayBookingsCard from "./TodayBookingsCard";

const quickLinks = [
  {
    name: "Bokningar",
    href: "/appointments",
    icon: Calendar,
    color: "bg-accent",
  },
  {
    name: "Tjänster",
    href: "/treatments",
    icon: Scissors,
    color: "bg-secondary",
  },
  {
    name: "Öppettider",
    href: "/working-hours",
    icon: Clock,
    color: "bg-secondary",
  },
];

export default function Page() {
  const todayLabel = format(new Date(), "EEEE d MMMM yyyy", { locale: sv });

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Hej!" description={todayLabel} />

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.name} href={link.href}>
            <Card className="hover:shadow-card transition-shadow cursor-pointer group">
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center`}
                >
                  <link.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {link.name}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Today's bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-display">
            Dagens bokningar
          </CardTitle>

          <Link href="/appointments">
            <Button variant="ghost" size="sm">
              Visa alla
              <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          <TodayBookingsCard />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
