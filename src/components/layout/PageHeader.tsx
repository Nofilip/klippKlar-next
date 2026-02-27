"use client";

import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** Shows CTA in sticky footer on mobile instead of inline */
  stickyMobileCTA?: boolean;
  /** Shows a back button (not shown on Dashboard) */
  showBackButton?: boolean;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  stickyMobileCTA = false,
  showBackButton = false,
}: PageHeaderProps) {
  const pathname = usePathname();

  // Don't show back button on dashboard
  const isDashboard = pathname === "/dashboard" || pathname === "/";
  const shouldShowBack = showBackButton && !isDashboard;

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8",
          className,
        )}
      >
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {shouldShowBack && (
              <Link href={"/dashboard"}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 -ml-2 text-muted-foreground cursor-pointer transition hover:bg-orange-500/10"
                  aria-label="Tillbaka"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              {title}
            </h1>
          </div>
          {description && (
            <p
              className={cn(
                "text-sm text-muted-foreground max-w-lg",
                shouldShowBack && "ml-8",
              )}
            >
              {description}
            </p>
          )}
        </div>
        {children && (
          <div
            className={cn(
              "flex items-center gap-3 shrink-0",
              stickyMobileCTA && "hidden md:flex",
            )}
          >
            {children}
          </div>
        )}
      </div>

      {/* Sticky mobile CTA */}
      {children && stickyMobileCTA && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 glass border-t border-border z-30 safe-area-bottom">
          <div className="flex items-center gap-3">{children}</div>
        </div>
      )}
    </>
  );
}
