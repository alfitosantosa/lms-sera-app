"use client";

import { type EvidenceInput, getErrorMessage } from "@/app/(types)";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

type EvidenceUploaderProps = {
  value: EvidenceInput[];
  onChange: (next: EvidenceInput[]) => void;
  disabled?: boolean;
};

/**
 * Unggah bukti observasi ke file server repo (`NEXT_PUBLIC_FILESERVER_URL`),
 * lalu simpan `fileUrl` yang dikembalikan sebagai `EvidenceInput`.
 * Pola & penanganan error mengikuti `components/exam/exam-image-upload.tsx`.
 */
export function EvidenceUploader({
  value,
  onChange,
  disabled = false,
}: EvidenceUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const clearInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Silakan pilih gambar bukti terlebih dahulu");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Ukuran gambar maksimal 2MB");
      clearInput();
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Format gambar harus PNG, JPG, atau WEBP");
      clearInput();
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_FILESERVER_URL}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal mengunggah bukti");
      }
      const data = await res.json();
      if (!data.fileUrl) {
        throw new Error("URL bukti tidak ditemukan dalam respons server");
      }

      onChange([
        ...value,
        {
          type: "IMAGE",
          url: data.fileUrl,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        },
      ]);
      clearInput();
      toast.success("Bukti berhasil diunggah");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">
        Bukti <span className="text-muted-foreground">(opsional)</span>
      </Label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((evidence, index) => (
            <div key={index} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={evidence.url}
                alt={evidence.fileName ?? `Bukti ${index + 1}`}
                className="border-border h-16 w-16 rounded-2xl border object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-5 w-5"
                aria-label="Hapus bukti"
                disabled={disabled}
                onClick={() => removeAt(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          disabled={disabled || isUploading}
          className="max-w-64"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isUploading}
          onClick={handleUpload}
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Mengunggah..." : "Unggah Bukti"}
        </Button>
      </div>
    </div>
  );
}
