"use client";

import { UserDataTypes } from "@/app/(types)";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search, X } from "lucide-react";
import * as React from "react";

interface StudentComboboxProps {
  students: UserDataTypes[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function StudentCombobox({ students = [], value, onValueChange, placeholder = "Pilih siswa...", disabled = false, className }: StudentComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredStudents = React.useMemo(() => {
    if (!searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter((student) => {
      const nameMatch = student.name?.toLowerCase().includes(term);
      const nisnMatch = student.nisn?.toLowerCase().includes(term);
      const classMatch = student.class?.name?.toLowerCase().includes(term);
      return nameMatch || nisnMatch || classMatch;
    });
  }, [students, searchTerm]);

  const selectedStudent = React.useMemo(() => {
    if (!value) return null;
    return students.find((student) => student.id === value) || null;
  }, [students, value]);

  const handleSelect = (student: UserDataTypes) => {
    onValueChange(student.id);
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
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between h-auto min-h-10 px-3 py-2 text-left", !selectedStudent && "text-muted-foreground", className)} disabled={disabled}>
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {selectedStudent ?
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="font-medium truncate w-full text-foreground">{selectedStudent.name}</span>
                {(selectedStudent.nisn || selectedStudent.class?.name) && (
                  <span className="text-xs text-muted-foreground truncate w-full">{[selectedStudent.nisn ? `NISN: ${selectedStudent.nisn}` : null, selectedStudent.class?.name].filter(Boolean).join(" · ")}</span>
                )}
              </div>
            : <span className="truncate">{placeholder}</span>}
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {selectedStudent && !disabled && <X className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" onClick={handleClear} />}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start" sideOffset={4}>
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input placeholder="Cari nama, NISN, atau kelas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
          </div>

          {/* Student List */}
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {filteredStudents.length === 0 ?
                <div className="py-6 text-center text-sm text-muted-foreground">{searchTerm ? "Tidak ada siswa yang ditemukan" : "Tidak ada data siswa"}</div>
              : filteredStudents.map((student) => (
                  <div key={student.id} onClick={() => handleSelect(student)} className={cn("flex items-center justify-between w-full gap-2 px-2 py-3 rounded-md cursor-pointer hover:bg-accent", value === student.id && "bg-accent")}>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate text-foreground">{student.name}</span>
                      {(student.nisn || student.class?.name) && <span className="text-xs text-muted-foreground truncate">{[student.nisn ? `NISN: ${student.nisn}` : null, student.class?.name].filter(Boolean).join(" · ")}</span>}
                    </div>
                    <Check className={cn("h-4 w-4 shrink-0 text-primary", value === student.id ? "opacity-100" : "opacity-0")} />
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
