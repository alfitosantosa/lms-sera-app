"use client";

import { type UserDataTypes } from "@/app/(types)";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

interface StudentComboboxProps {
  students: UserDataTypes[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function StudentCombobox({
  students = [],
  value,
  onValueChange,
  placeholder = "Pilih siswa...",
  disabled = false,
  className,
}: StudentComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter((student) => {
      const nameMatch = student.name?.toLowerCase().includes(term);
      const nisnMatch = student.nisn?.toLowerCase().includes(term);
      const classMatch = student.class?.name?.toLowerCase().includes(term);
      return nameMatch || nisnMatch || classMatch;
    });
  }, [students, searchTerm]);

  const selectedStudent = useMemo(() => {
    if (!value) return null;
    return students.find((student) => student.id === value) || null;
  }, [students, value]);

  const handleSelect = (student: UserDataTypes) => {
    onValueChange(student.id);
    setOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onValueChange("");
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-10 w-full justify-between px-3 py-2 text-left",
            !selectedStudent && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {selectedStudent ? (
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="text-foreground w-full truncate font-medium">
                  {selectedStudent.name}
                </span>
                {(selectedStudent.nisn || selectedStudent.class?.name) && (
                  <span className="text-muted-foreground w-full truncate text-xs">
                    {[
                      selectedStudent.nisn
                        ? `NISN: ${selectedStudent.nisn}`
                        : null,
                      selectedStudent.class?.name,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
              </div>
            ) : (
              <span className="truncate">{placeholder}</span>
            )}
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-1">
            {selectedStudent && !disabled && (
              <Button onClick={handleClear}>
                <X className="h-4 w-4 cursor-pointer opacity-50 hover:opacity-100" />
              </Button>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start" sideOffset={4}>
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Cari nama, NISN, atau kelas..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Student List */}
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {filteredStudents.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  {searchTerm
                    ? "Tidak ada siswa yang ditemukan"
                    : "Tidak ada data siswa"}
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleSelect(student)}
                    className={cn(
                      "hover:bg-accent flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-3",
                      value === student.id && "bg-accent",
                    )}
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-foreground truncate font-medium">
                        {student.name}
                      </span>
                      {(student.nisn || student.class?.name) && (
                        <span className="text-muted-foreground truncate text-xs">
                          {[
                            student.nisn ? `NISN: ${student.nisn}` : null,
                            student.class?.name,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "text-primary h-4 w-4 shrink-0",
                        value === student.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
