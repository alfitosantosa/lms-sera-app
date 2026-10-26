"use client";

import { AppSidebar } from "@/components/layout/appSidebar";
import { ModuleGuard } from "@/components/layout/ModuleGuard";
import { TourProvider } from "@/components/tour/TourProvider";
import { TourReplayButton } from "@/components/tour/TourReplayButton";
import Footer from "@/components/layout/footer";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TOUR_HEADER } from "@/lib/tours/selectors";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import InstallButton from "./installButton";

const AUTH_ROUTES = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/register",
  "/landing",
  "/produk",
];

export default function ConditionalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route),
  );

  if (isAuthPage) {
    // Render tanpa sidebar, navbar, footer - fullscreen bersih
    return <>{children}</>;
  }

  // Render dengan sidebar
  return (
    <TourProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background flex min-h-screen flex-col">
          <header
            data-tour={TOUR_HEADER}
            className="bg-background/95 supports-backdrop-filter:bg-background/60 border-border sticky shrink-0 items-center gap-2 border-b px-4 py-7 backdrop-blur md:px-6"
          >
            <SidebarTrigger className="" />
            <div className="flex-1" />
            {/* <TourReplayButton /> */}
          </header>
          <main className="flex-1 overflow-auto">
            <div className="mx-auto space-y-6 p-4 md:p-6 lg:p-8">
              <ModuleGuard>{children}</ModuleGuard>
            </div>
          </main>
          <Footer />
          <InstallButton />
        </SidebarInset>
      </SidebarProvider>
    </TourProvider>
  );
}
