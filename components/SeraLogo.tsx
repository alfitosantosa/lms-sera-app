import Image from "next/image";

import Logo from "@/public/Logo.svg";
import { cn } from "@/lib/utils";

export const CLIENT_NAME = process.env.NEXT_PUBLIC_CLIENT_NAME || "Sera App";

/**
 * The one lockup the product names itself with: the emblem, then the name.
 * `Logo.svg` carries its own light plate, so it is set on a light ground — on
 * `bg-navy` it reads as a badge rather than a knocked-out mark.
 */
export function SeraLogo({
  className,
  markClassName,
  wordClassName,
  subtitle,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
  subtitle?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={Logo}
        alt=""
        className={cn("h-9 w-auto shrink-0", markClassName)}
      />
      <span className="flex flex-col">
        <span
          className={cn(
            "text-foreground text-base leading-none font-semibold tracking-tight",
            wordClassName,
          )}
        >
          {CLIENT_NAME}
        </span>
        {subtitle ? (
          <span className="text-muted-foreground mt-1.5 text-xs leading-none">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
