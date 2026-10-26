"use client";

import AttendanceDashboard from "@/components/dashboard/AttendanceDashboard";
import CoreDashboard from "@/components/dashboard/CoreDashboard";
import { normalizeModules } from "@/config/modules";
import { useGetUserByIdBetterAuth } from "@/hooks/Users/useUsersByIdBetterAuth";
import { useSession } from "@/services/auth/authClients";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: userData } = useGetUserByIdBetterAuth(
    session?.user?.id ?? "",
  );
  const modules = normalizeModules(userData?.foundation?.modules);

  // Hook absensi hanya dipasang bila modulnya aktif.
  if (modules.includes("absensi")) return <AttendanceDashboard />;
  return <CoreDashboard modules={modules} />;
}
