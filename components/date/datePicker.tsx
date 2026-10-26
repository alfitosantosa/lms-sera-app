"use client";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { type DateRange } from "react-day-picker";

export function DatePickerWithRange({
  date,
  setDate,
  className,
}: {
  date?: DateRange;
  setDate?: (date: DateRange | undefined) => void;
  className?: string;
}) {
  // ✅ Use controlled date only, no internal state
  const handleSelect = useCallback(
    (newDate: DateRange | undefined) => {
      setDate?.(newDate);
    },
    [setDate],
  );

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-75 justify-start overflow-hidden text-left font-normal",
              !date && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {date?.from ? (
              <span className="truncate">
                {date.to
                  ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
                  : format(date.from, "LLL dd, y")}
              </span>
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
