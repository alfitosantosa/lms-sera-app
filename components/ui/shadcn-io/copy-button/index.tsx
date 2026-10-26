"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import { MouseEvent, useCallback, useEffect, useState } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer rounded-2xl transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/80 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        muted: "bg-secondary text-muted-foreground",
        destructive:
          "bg-destructive-solid text-white hover:bg-destructive-strong",
        outline:
          "border border-border bg-card hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "size-8 rounded-xl [&_svg]:size-4",
        sm: "size-6 rounded-lg [&_svg]:size-3",
        md: "size-10 rounded-xl [&_svg]:size-5",
        lg: "size-12 rounded-2xl [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type CopyButtonProps = Omit<HTMLMotionProps<"button">, "children" | "onCopy"> &
  VariantProps<typeof buttonVariants> & {
    content?: string;
    delay?: number;
    onCopy?: (content: string) => void;
    isCopied?: boolean;
    onCopyChange?: (isCopied: boolean) => void;
  };

function CopyButton({
  content,
  className,
  size,
  variant,
  delay = 3000,
  onClick,
  onCopy,
  isCopied,
  onCopyChange,
  ...props
}: CopyButtonProps) {
  const [localIsCopied, setLocalIsCopied] = useState(isCopied ?? false);
  const Icon = localIsCopied ? CheckIcon : CopyIcon;

  useEffect(() => {
    setLocalIsCopied(isCopied ?? false);
  }, [isCopied]);

  const handleIsCopied = useCallback(
    (isCopied: boolean) => {
      setLocalIsCopied(isCopied);
      onCopyChange?.(isCopied);
    },
    [onCopyChange],
  );

  const handleCopy = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (isCopied) return;
      if (content) {
        navigator.clipboard
          .writeText(content)
          .then(() => {
            handleIsCopied(true);
            setTimeout(() => handleIsCopied(false), delay);
            onCopy?.(content);
          })
          .catch((error) => {
            console.error("Error copying command", error);
          });
      }
      onClick?.(e);
    },
    [isCopied, content, delay, onClick, onCopy, handleIsCopied],
  );

  return (
    <motion.button
      data-slot="copy-button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={handleCopy}
      {...props}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={localIsCopied ? "check" : "copy"}
          data-slot="copy-button-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export { CopyButton, buttonVariants, type CopyButtonProps };
