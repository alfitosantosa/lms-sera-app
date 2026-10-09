import { cn } from "@/lib/shadCN/utils";
import { ComponentProps } from "react";

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-xl", className)}
      {...props}
    />
  );
}

export { Skeleton };
