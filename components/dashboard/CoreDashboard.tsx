"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MODULES, type ModuleKey } from "@/config/modules";

export default function CoreDashboard({ modules }: { modules: ModuleKey[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Modul absensi tidak aktif. Ringkasan inti SIAKAD tetap tersedia lewat
          menu di samping.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module}>
            <CardHeader>
              <CardTitle className="text-base">{MODULES[module].label}</CardTitle>
              <CardDescription>{MODULES[module].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs">
                Modul aktif untuk yayasan ini.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {modules.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paket inti</CardTitle>
            <CardDescription>
              Yayasan ini hanya memakai modul inti SIAKAD. Admin yayasan dapat
              menambah modul lain dari halaman profil yayasan.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
