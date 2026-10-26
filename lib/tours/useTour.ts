"use client";

import { useCallback, useEffect, useRef } from "react";
import { useNextStep } from "nextstepjs";
import { useSearchParams } from "next/navigation";

import { useBranch } from "@/context/BranchContext";
import { useGetUserByIdBetterAuth } from "@/hooks/Users/useUsersByIdBetterAuth";
import { useSession } from "@/services/auth/authClients";
import { getRoleMenuKey } from "@/lib/ui/roleKey";
import { readTourDone, tourKeyForMenuKey, type TourKey } from "./tourModel";

/** Beri waktu shell mengecat dulu sebelum overlay muncul. */
const START_DELAY_MS = 600;

/**
 * User yang login dan tur untuk role-nya. Resolusinya sengaja sama dengan `AppSidebar`:
 * role dari `user_data.role.name`, cabang dari query `branchId` atau BranchContext.
 */
export function useTourKey(): {
  userId: string | null;
  menuKey: string | null;
  tourKey: TourKey | null;
} {
  const { data: session } = useSession();
  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");
  const { selectedBranchId } = useBranch();
  const searchParams = useSearchParams();

  const userId = session?.user?.id ?? null;
  const roleName = userData?.role?.name;
  const school = searchParams?.get("branchId") ?? selectedBranchId ?? "all";
  const menuKey = roleName ? getRoleMenuKey(roleName, school) : null;

  return {
    userId,
    menuKey,
    tourKey: menuKey ? tourKeyForMenuKey(menuKey) : null,
  };
}

/** Menjalankan tur role sekali per browser, saat pengguna pertama kali masuk dashboard. */
export function useTourAutoStart(): void {
  const { startNextStep } = useNextStep();
  const { userId, tourKey } = useTourKey();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !userId || !tourKey) return;
    if (readTourDone(userId, tourKey)) return;

    // Latch sebelum timer dipasang, dan sengaja TANPA cleanup: StrictMode melakukan
    // mount -> unmount -> mount, cleanup akan membatalkan timer sementara latch menahan
    // efek kedua sehingga tur tidak pernah jalan.
    started.current = true;
    setTimeout(() => startNextStep(tourKey), START_DELAY_MS);
  }, [userId, tourKey, startNextStep]);
}

/** Titik masuk tombol Panduan. */
export function useTourReplay(): { replay: () => void; canReplay: boolean } {
  const { startNextStep } = useNextStep();
  const { tourKey } = useTourKey();

  const replay = useCallback(() => {
    if (tourKey) startNextStep(tourKey);
  }, [startNextStep, tourKey]);

  return { replay, canReplay: tourKey !== null };
}
