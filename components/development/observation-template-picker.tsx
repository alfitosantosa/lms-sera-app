"use client";

import { type DailyLogDTO } from "@/app/(types)/types/development-types";
import { useGetDailyLogs } from "@/app/(hooks)/hooks/Development/useDailyLogs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { History, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * ponytail: template observasi disimpan di `localStorage` — per browser, tidak
 * dibagi antar guru/perangkat. Upgrade path: model `ObservationTemplate` +
 * endpoint yayasan bila template perlu dibagikan.
 */
const TEMPLATE_STORAGE_KEY = "development.observation.templates";

type ObservationTemplatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  studentId?: string;
  onCopyPrevious?: (log: DailyLogDTO) => void;
};

export function ObservationTemplatePicker({
  value,
  onChange,
  studentId,
  onCopyPrevious,
}: ObservationTemplatePickerProps) {
  const [templates, setTemplates] = useState<string[]>([]);

  // Dibaca setelah mount agar tidak berbeda antara server & klien.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setTemplates(parsed.filter((t): t is string => typeof t === "string"));
      }
    } catch {
      setTemplates([]);
    }
  }, []);

  const persist = (next: string[]) => {
    setTemplates(next);
    try {
      window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      toast.error("Template tidak dapat disimpan di perangkat ini");
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const { data: previous } = useGetDailyLogs({
    studentId,
    limit: 1,
    enabled: Boolean(studentId) && menuOpen,
  });
  const previousLog = previous?.data?.[0];

  return (
    <DropdownMenu onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Sparkles className="h-4 w-4" />
          Template
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Template Observasi</DropdownMenuLabel>
        {templates.length === 0 ? (
          <DropdownMenuItem disabled>Belum ada template</DropdownMenuItem>
        ) : (
          templates.map((template) => (
            <DropdownMenuItem
              key={template}
              onSelect={() => onChange(template)}
              className="flex items-start justify-between gap-2"
            >
              <span className="line-clamp-2">{template}</span>
              <button
                type="button"
                aria-label="Hapus template"
                className="text-muted-foreground hover:text-destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  persist(templates.filter((t) => t !== template));
                }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={value.trim().length === 0}
          onSelect={() => {
            const trimmed = value.trim();
            if (!trimmed || templates.includes(trimmed)) return;
            persist([...templates, trimmed]);
            toast.success("Template disimpan");
          }}
        >
          <Sparkles className="h-4 w-4" />
          Simpan teks ini sebagai template
        </DropdownMenuItem>

        {onCopyPrevious && studentId && (
          <DropdownMenuItem
            disabled={!previousLog}
            onSelect={() => previousLog && onCopyPrevious(previousLog)}
          >
            <History className="h-4 w-4" />
            Ambil dari log sebelumnya
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
