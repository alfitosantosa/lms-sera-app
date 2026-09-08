"use client";

import { UserDataTypes } from "@/app/(types)";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search, X } from "lucide-react";
import * as React from "react";

interface TeacherComboboxProps {
  teachers: UserDataTypes[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TeacherCombobox({ teachers, value, onValueChange, placeholder = "Pilih guru...", disabled = false, className }: TeacherComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredTeachers = React.useMemo(() => {
    if (!searchTerm) return teachers;
    return teachers.filter((teacher) => teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) || teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [teachers, searchTerm]);

  const selectedTeacher = React.useMemo(() => {
    if (!value) return null;
    return teachers.find((teacher) => teacher.id === value) || null;
  }, [teachers, value]);

  const handleSelect = (teacher: UserDataTypes) => {
    onValueChange(teacher.id);
    setOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between h-auto min-h-10 px-3 py-2", !selectedTeacher && "text-muted-foreground", className)} disabled={disabled}>
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {selectedTeacher ?
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="font-medium truncate w-full">{selectedTeacher.name}</span>
                <span className="text-xs text-muted-foreground truncate w-full">{selectedTeacher.position}</span>
              </div>
            : <span className="truncate">{placeholder}</span>}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {selectedTeacher && !disabled && <X className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" onClick={handleClear} />}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start" sideOffset={4}>
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input placeholder="Cari nama guru..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
          </div>

          {/* Teacher List */}
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {filteredTeachers.length === 0 ?
                <div className="py-6 text-center text-sm text-muted-foreground">{searchTerm ? "Tidak ada guru yang ditemukan" : "Tidak ada data guru"}</div>
              : filteredTeachers.map((teacher) => (
                  <div key={teacher.id} onClick={() => handleSelect(teacher)} className={cn("flex items-center justify-between w-full gap-2 px-2 py-3 rounded-md cursor-pointer hover:bg-accent", value === teacher.id && "bg-accent")}>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">{teacher.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{teacher.position}</span>
                    </div>
                    <Check className={cn("h-4 w-4 shrink-0", value === teacher.id ? "opacity-100" : "opacity-0")} />
                  </div>
                ))
              }
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
