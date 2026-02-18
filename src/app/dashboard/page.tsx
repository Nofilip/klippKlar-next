import Link from "next/link";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Calendar, Scissors, Users, Clock, ArrowRight, User } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";

// (tillfälligt) mockade bokningar — byt ut mot riktig data senare
type Booking = {
  id: string;
  status: "booked" | "cancelled";
  start_dt: string;
  customer_name: string;
  service_name: string;
  staff_name: string;
};

const mockBookings: Booking[] = [];

const quickLinks = [
  { name: "Bokningar", href: "/bookings", icon: Calendar, color: "bg-accent" },
  { name: "Tjänster", href: "/services", icon: Scissors, color: "bg-secondary" },
  { name: "Frisörer", href: "/staff", icon: Users, color: "bg-accent" },
  { name: "Arbetstider", href: "/working-hours", icon: Clock, color: "bg-secondary" },
];

export default function DashboardPage() {
  const todayLabel = format(new Date(), "EEEE d MMMM yyyy", { locale: sv });

  const todaysBookings = mockBookings.filter((b) => b.status === "booked");

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Hej!" description={todayLabel} />

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.name} href={link.href}>
            <Card className="hover:shadow-card transition-shadow cursor-pointer group">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center`}>
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
          <CardTitle className="text-lg font-display">Dagens bokningar</CardTitle>

          <Link href="/bookings">
            <Button variant="ghost" size="sm">
              Visa alla
              <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          {todaysBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Inga bokningar"
              description="Det finns inga bokningar för idag."
              action={
                <Link href="/bookings">
                  <Button variant="outline">Gå till bokningar</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {todaysBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {booking.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{booking.service_name}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(booking.start_dt), "HH:mm")}
                    </p>
                    <p className="text-xs text-muted-foreground">{booking.staff_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
