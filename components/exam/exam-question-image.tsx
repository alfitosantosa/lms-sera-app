"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ExamQuestionImageProps = {
  src: string;
  alt: string;
};

/** Gambar soal; placeholder bila URL gambar rusak. */
export function ExamQuestionImage({ src, alt }: ExamQuestionImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div className="bg-muted text-muted-foreground border-border flex h-40 w-full max-w-[600px] items-center justify-center rounded-2xl border text-sm">
        Gambar soal tidak dapat dimuat
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={600}
      height={400}
      unoptimized={src.includes("file.santosatechid.cloud")}
      onError={() => setFailed(true)}
      className="border-border h-auto max-h-[420px] w-full max-w-[600px] rounded-2xl border object-contain"
    />
  );
}
