"use client";

import { AppSidebar } from "@/components/appSidebar";
import Footer from "@/components/footer";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import React from "react";
import InstallButton from "./installButton";

const AUTH_ROUTES = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/register",
  "/landing",
];

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-h-screen flex-col">
        <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky shrink-0 items-center gap-2 border-b px-4 py-7 backdrop-blur md:px-6">
          <SidebarTrigger className="" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto space-y-6 p-4 md:p-6 lg:p-8">{children}</div>
        </main>
        <Footer />
        <InstallButton />
      </SidebarInset>
    </SidebarProvider>
  );
}
