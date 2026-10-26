"use client";

import { NextStep, NextStepProvider, type Tour } from "nextstepjs";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { useSession } from "@/services/auth/authClients";
import { buildTours } from "@/lib/tours/tours";
import { isTourKey, writeTourDone } from "@/lib/tours/tourModel";
import { useTourAutoStart, useTourKey } from "@/lib/tours/useTour";
import { TourCard } from "./TourCard";
import { TourDialogSync } from "./TourDialogSync";

const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * Tur onboarding, dipasang hanya di sekitar shell dashboard — halaman landing dan auth
 * tidak ikut tersentuh.
 */
export function TourProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { userId, menuKey } = useTourKey();
  const [mounted, setMounted] = useState(false);
  const [desktop, setDesktop] = useState(true);

  // Tur murni klien: `matchMedia` dan `localStorage` tidak ada saat SSR, dan nextstepjs
  // tidak boleh ikut dirender ke HTML server.
  useEffect(() => {
    setDesktop(window.matchMedia(DESKTOP_QUERY).matches);
    setMounted(true);
  }, []);

  const tours: Tour[] = useMemo(
    () => buildTours({ desktop, menuKey: menuKey ?? "null" }),
    [desktop, menuKey],
  );

  const markDone = (tourName: string | null) => {
    if (userId && tourName && isTourKey(tourName)) writeTourDone(userId, tourName);
  };

  if (!mounted) return <NextStepProvider>{children}</NextStepProvider>;

  return (
    <NextStepProvider>
      <NextStep
        steps={tours}
        cardComponent={TourCard}
        onComplete={markDone}
        onSkip={(_step, tourName) => markDone(tourName)}
        // Jangan lompat ke atas halaman setelah tur selesai.
        scrollToTop={false}
      >
        {children}
      </NextStep>
      <TourAutoStart />
      <TourDialogSync tours={tours} />
    </NextStepProvider>
  );
}

/** Komponen daun tersendiri supaya bisa memanggil `useNextStep()` dari dalam provider. */
function TourAutoStart() {
  useTourAutoStart();
  return null;
}
