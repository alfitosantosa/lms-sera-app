"use client";

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

interface DatePickerTimeProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  dateLabel?: string;
  timeLabel?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePickerTime({ value, onChange, dateLabel = "Date", timeLabel = "Time", placeholder = "Select date", disabled = false }: DatePickerTimeProps) {
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(value);
  const [time, setTime] = React.useState<string>(value ? format(value, "HH:mm:ss") : "10:30:00");

  // Sync internal date with external value
  React.useEffect(() => {
    if (value) {
      setInternalDate(value);
      setTime(format(value, "HH:mm:ss"));
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setInternalDate(undefined);
      onChange?.(undefined);
      setOpen(false);
      return;
    }

    // Combine selected date with current time
    const [hours, minutes, seconds] = time.split(":").map(Number);
    const combined = new Date(selectedDate);
    combined.setHours(hours, minutes, seconds);

    setInternalDate(combined);
    onChange?.(combined);
    setOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);

    if (internalDate) {
      // Combine current date with new time
      const [hours, minutes, seconds] = newTime.split(":").map(Number);
      const combined = new Date(internalDate);
      combined.setHours(hours, minutes || 0, seconds || 0);

      setInternalDate(combined);
      onChange?.(combined);
    }
  };

  return (
    <FieldGroup className="flex-row gap-2">
      <Field>
        <FieldLabel htmlFor="date-picker">{dateLabel}</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" id="date-picker" className="w-40 justify-between font-normal" disabled={disabled}>
              {internalDate ? format(internalDate, "PPP") : placeholder}
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar mode="single" selected={internalDate} captionLayout="dropdown" defaultMonth={internalDate} onSelect={handleDateSelect} disabled={disabled} />
          </PopoverContent>
        </Popover>
      </Field>
      <Field className="w-32">
        <FieldLabel htmlFor="time-picker">{timeLabel}</FieldLabel>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={time}
          onChange={handleTimeChange}
          disabled={disabled}
          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </Field>
    </FieldGroup>
  );
}
