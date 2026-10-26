"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModulePicker } from "@/components/foundation/ModulePicker";
import { normalizeModules, type ModuleKey } from "@/config/modules";
import { useUpdateFoundation } from "@/hooks/Foundation/useFoundation";
import { useGetUserByIdBetterAuth } from "@/hooks/Users/useUsersByIdBetterAuth";
import { useSession } from "@/services/auth/authClients";
import type { foundationTypes } from "@/types/foundation-types";

const EDITOR_ROLES = ["admin", "yayasan"];

export default function ModulesPage() {
  const { data: session } = useSession();
  const { data: userData, isLoading } = useGetUserByIdBetterAuth(
    session?.user?.id ?? "",
  );
  const updateFoundation = useUpdateFoundation();
  const [draft, setDraft] = useState<ModuleKey[] | null>(null);

  const foundation = userData?.foundation;
  const saved = normalizeModules(foundation?.modules);
  const value = draft ?? saved;
  const canEdit = EDITOR_ROLES.includes(
    (userData?.role?.name ?? "").trim().toLowerCase(),
  );

  // Form mengikuti yayasan aktif; draft dibuang saat berpindah yayasan.
  useEffect(() => {
    setDraft(null);
  }, [foundation?.id]);

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Memuat modul...</p>;
  }

  if (!foundation) {
    return (
      <p className="text-muted-foreground text-sm">
        Akun ini belum terhubung ke yayasan.
      </p>
    );
  }

  const handleSave = async () => {
    await updateFoundation.mutateAsync({
      ...foundation,
      modules: value,
    } as foundationTypes);
    setDraft(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modul yayasan</h1>
        <p className="text-muted-foreground text-sm">
          Pilih modul yang dipakai {foundation.name}. Menu dan API modul yang
          tidak dipilih langsung dinonaktifkan untuk seluruh pengguna yayasan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modul opsional</CardTitle>
          <CardDescription>
            {canEdit
              ? "Perubahan berlaku setelah disimpan dan langsung terlihat di sidebar."
              : "Hanya admin yayasan yang dapat mengubah pilihan modul."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ModulePicker
            value={value}
            onChange={setDraft}
            disabled={!canEdit || updateFoundation.isPending}
          />

          {canEdit && (
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={draft === null || updateFoundation.isPending}
              >
                {updateFoundation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan modul
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
