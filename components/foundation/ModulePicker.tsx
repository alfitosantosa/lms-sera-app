"use client";

import { ALL_MODULES, MODULES, type ModuleKey } from "@/config/modules";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type ModulePickerProps = {
  value: ModuleKey[];
  onChange: (modules: ModuleKey[]) => void;
  disabled?: boolean;
};

/** Pilih modul opsional untuk satu yayasan. Core SIAKAD selalu aktif. */
export function ModulePicker({ value, onChange, disabled }: ModulePickerProps) {
  const toggle = (module: ModuleKey) => {
    onChange(
      value.includes(module)
        ? value.filter((item) => item !== module)
        : ALL_MODULES.filter((item) => item === module || value.includes(item)),
    );
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-dashed p-3">
        <p className="text-sm font-medium">Inti SIAKAD — selalu aktif</p>
        <p className="text-muted-foreground text-xs">
          Pengguna, sekolah, kelas, tahun ajaran, mata pelajaran, jadwal,
          kalender, dan pengumuman.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {ALL_MODULES.map((module) => {
          const checked = value.includes(module);
          return (
            <button
              key={module}
              type="button"
              role="checkbox"
              aria-checked={checked}
              disabled={disabled}
              onClick={() => toggle(module)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                checked ? "border-primary bg-primary/5" : "hover:border-primary/40",
                disabled && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input",
                )}
              >
                {checked && <Check className="h-3.5 w-3.5" />}
              </span>
              <span>
                <span className="block text-sm font-medium">
                  {MODULES[module].label}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {MODULES[module].description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
