"use client";

import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { ComponentProps } from "react";

function Checkbox({
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-border bg-foreground/5 data-[state=checked]:bg-interactive-fill data-[state=checked]:text-white data-[state=checked]:border-interactive-fill focus-visible:border-interactive-border focus-visible:ring-interactive-fill/25 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4.5 shrink-0 rounded-full border transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
