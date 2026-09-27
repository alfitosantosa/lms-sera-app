"use client";

import { getErrorMessage } from "@/app/(types)";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExamQuestionImage } from "./exam-question-image";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

/**
 * Unggah gambar soal ke file server repo (`NEXT_PUBLIC_FILESERVER_URL`).
 * Validasi ukuran & format dilakukan sebelum file dikirim.
 */
export function ExamImageUpload({
  value,
  onChange,
  disabled = false,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (file: File | undefined) => {
    if (!file) {
      setFileName(null);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Ukuran gambar maksimal 2MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileName(null);
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Format gambar harus PNG, JPG, atau WEBP");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileName(null);
      return;
    }
    setFileName(file.name);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Silakan pilih gambar terlebih dahulu");
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
        throw new Error(errorData.message || "Gagal mengunggah gambar");
      }
      const data = await res.json();
      if (!data.fileUrl)
        throw new Error("URL gambar tidak ditemukan dalam respons server");

      onChange(data.fileUrl);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileName(null);
      toast.success("Gambar berhasil diunggah");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFileName(null);
    onChange(null);
    toast.success("Gambar dihapus");
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="exam-question-image">
        Gambar Soal{" "}
        <span className="text-muted-foreground text-xs">(opsional)</span>
      </Label>

      {value && (
        <div className="relative w-fit max-w-full">
          <ExamQuestionImage src={value} alt="Gambar soal" />
        </div>
      )}

      <Input
        id="exam-question-image"
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        disabled={disabled || isUploading}
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUpload}
          disabled={disabled || isUploading || !fileName}
        >
          <Upload className="mr-2 size-4" />
          {isUploading ? "Mengunggah..." : "Unggah Gambar"}
        </Button>

        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <Trash2 className="mr-2 size-4" />
            Hapus Gambar
          </Button>
        )}
      </div>

      <p className="text-muted-foreground text-xs">
        Format PNG, JPG, atau WEBP. Maksimal 2MB.
        {fileName ? ` Dipilih: ${fileName}` : ""}
      </p>
    </div>
  );
}
