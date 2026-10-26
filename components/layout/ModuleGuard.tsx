"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ALL_MODULES, moduleForPath, moduleLabel } from "@/config/modules";
import { useGetUserByIdBetterAuth } from "@/hooks/Users/useUsersByIdBetterAuth";
import { useSession } from "@/services/auth/authClients";

/**
 * Menolak URL dashboard milik modul yang tidak aktif untuk yayasan pemanggil.
 * Gate API tetap di server (`resolveFoundation`); ini hanya lapisan UX.
 */
export function ModuleGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { data: userData, isLoading } = useGetUserByIdBetterAuth(
    session?.user?.id ?? "",
  );

  const moduleKey = moduleForPath(pathname);
  const modules = userData?.foundation?.modules ?? ALL_MODULES;
  const blocked = moduleKey !== null && !modules.includes(moduleKey);

  useEffect(() => {
    if (!blocked || !moduleKey) return;
    toast.error(`Modul ${moduleLabel(moduleKey)} tidak aktif untuk yayasan ini`);
    router.replace("/dashboard");
  }, [blocked, moduleKey, router]);

  if (moduleKey && isLoading && !userData) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
        Memeriksa modul...
      </div>
    );
  }

  if (blocked) return null;

  return <>{children}</>;
}
