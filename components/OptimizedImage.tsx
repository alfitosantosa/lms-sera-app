"use client";

import { Skeleton } from "@/components/ui/skeleton";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "onLoadingComplete"> {
  fallback?: string;
  showSkeleton?: boolean;
  containerClassName?: string;
  onLoadingComplete?: () => void;
}

/**
 * OptimizedImage Component
 *
 * A wrapper around Next.js Image component with:
 * - Automatic fallback for failed images
 * - Loading skeleton support
 * - Error handling
 * - Consistent sizing and optimization
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="https://lh3.googleusercontent.com/..."
 *   alt="User avatar"
 *   width={160}
 *   height={160}
 *   className="rounded-full"
 *   fallback="https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png"
 *   priority
 * />
 * ```
 */
export default function OptimizedImage({
  fallback = "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png",
  showSkeleton = false,
  containerClassName = "",
  onLoadingComplete,
  ...props
}: OptimizedImageProps) {
  const [src, setSrc] = useState(props.src);
  const [isLoading, setIsLoading] = useState(showSkeleton);
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
    if (fallback && src !== fallback) {
      setSrc(fallback);
    }
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
    onLoadingComplete?.();
  };

  return (
    <div className={containerClassName}>
      {isLoading && <Skeleton className="w-full h-full" />}
      <Image
        {...props}
        src={src}
        onError={handleError}
        onLoadingComplete={handleLoadingComplete}
        style={{
          display: isLoading ? "none" : "block",
          ...props.style,
        }}
      />
    </div>
  );
}
