"use client";

import { DatePickerWithRange } from '@/components/date/datePicker';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

export default function DatePage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Date Picker Test Page</h1>
        <p className="text-muted-foreground">
          Testing controlled state for the date range picker.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Picker</h2>
            <DatePickerWithRange 
                date={date} 
                setDate={setDate} 
            />
        </div>

        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">State Value</h2>
            <div className="rounded-md bg-slate-950 p-4">
                <pre className="text-xs text-slate-50 overscroll-x-auto">
                    {JSON.stringify(date, null, 2)}
                </pre>
            </div>
            <div className="mt-2">
                <p><strong>From:</strong> {date?.from ? date.from.toString() : 'Not selected'}</p>
                <p><strong>To:</strong> {date?.to ? date.to.toString() : 'Not selected'}</p>
            </div>
        </div>
      </div>
    </div>
  );
}