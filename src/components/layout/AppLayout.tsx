"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Clock,
  Shield,
  PhoneCall,
  Menu,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Bokningar", href: "/appointments", icon: Calendar },
  { name: "Tjänster", href: "/treatments", icon: Scissors },
  { name: "Öppettider", href: "/working-hours", icon: Clock },
];

const ownerNavigation = [
  { name: "Inloggningar", href: "/admin-users", icon: Shield },
  { name: "IVR Test", href: "/ivr-test", icon: PhoneCall },
];

type AppUser = {
  email: string;
  role: "owner" | "admin";
} | null;

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Temporary mock auth.
 * Replace later with your real auth hook/provider.
 */
function useMockAuth() {
  const user: AppUser = { email: "demo@klippklar.se", role: "admin" };
  const isOwner = user?.role === "owner";

  const logout = async () => {
    // placeholder
  };

  return { user, isOwner, logout };
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isOwner, logout } = useMockAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allNavigation = isOwner
    ? [...navigation, ...ownerNavigation]
    : navigation;

  const handleLogout = async () => {
    await logout();
    // placeholder: later you can use router.push("/login") after you build login
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col grow bg-card border-r border-border">
          {/* Brand bar */}
          <div className="brand-bar" />

          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-border">
            <h1 className="text-xl font-semibold text-gradient">
              Salongsadmin
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {allNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-accent/70">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.email ?? "Inte inloggad"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role === "owner" ? "Ägare" : "Admin"}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground hover:bg-accent shrink-0"
                aria-label="Logga ut"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40">
        <div className="brand-bar" />
        <div className="glass border-b border-border">
          <div className="flex items-center justify-between h-14 px-4">
            <h1 className="text-lg font-semibold text-gradient">
              Salongsadmin
            </h1>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="touch-target"
                  aria-label="Öppna meny"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="brand-bar" />
                  <div className="flex items-center h-14 px-5 border-b border-border">
                    <span className="font-semibold text-lg">Meny</span>
                  </div>

                  <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                    {allNavigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all touch-target",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground",
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="p-4 border-t border-border">
                    <div className="mb-4 p-3 rounded-xl bg-accent/70">
                      <p className="text-sm font-medium truncate">
                        {user?.email ?? "Inte inloggad"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.role === "owner" ? "Ägare" : "Admin"}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logga ut
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="pt-14 lg:pt-0 min-h-screen">{children}</div>
      </main>
    </div>
  );
}
