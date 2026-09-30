import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "selection:bg-primary selection:text-primary-foreground file:text-foreground placeholder:text-muted-foreground h-11 w-full min-w-0 rounded-2xl border border-border bg-foreground/5 px-4 py-2.5 text-base transition-[color,background-color,border-color,box-shadow] outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-interactive-border focus-visible:bg-interactive-surface focus-visible:ring-[3px] focus-visible:ring-interactive-fill/25",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
