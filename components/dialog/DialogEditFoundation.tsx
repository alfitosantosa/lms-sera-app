"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateFoundation } from "@/app/(hooks)/hooks/Foundation/useFoundation";
import { foundationTypes } from "@/app/(types)/types/foundation-types";
import { Loader2 } from "lucide-react";

// Validation schema
const foundationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama yayasan harus diisi"),
  foundationCode: z.string().min(1, "Kode yayasan harus diisi"),
  address: z.string().min(1, "Alamat harus diisi"),
  phone: z.string().min(1, "Nomor telepon harus diisi"),
  imageUrl: z.string().optional(),
});

type FoundationFormData = z.infer<typeof foundationSchema>;

interface DialogEditFoundationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foundation: foundationTypes;
}

export function DialogEditFoundation({
  open,
  onOpenChange,
  foundation,
}: DialogEditFoundationProps) {
  const updateFoundation = useUpdateFoundation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FoundationFormData>({
    resolver: zodResolver(foundationSchema),
    defaultValues: {
      id: foundation.id,
      name: foundation.name,
      foundationCode: foundation.foundationCode,
      address: foundation.address,
      phone: foundation.phone,
      imageUrl: foundation.imageUrl || "",
    },
  });

  // Reset form when foundation data changes
  useState(() => {
    form.reset({
      id: foundation.id,
      name: foundation.name,
      foundationCode: foundation.foundationCode,
      address: foundation.address,
      phone: foundation.phone,
      imageUrl: foundation.imageUrl || "",
    });
  });

  const onSubmit = async (data: FoundationFormData) => {
    setIsSubmitting(true);
    try {
      await updateFoundation.mutateAsync(data as foundationTypes);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error updating foundation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Yayasan</DialogTitle>
          <DialogDescription>
            Ubah informasi yayasan. Klik simpan untuk menyimpan perubahan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama Yayasan <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama yayasan"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Foundation Code */}
            <FormField
              control={form.control}
              name="foundationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Kode Yayasan <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan kode yayasan"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Alamat <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan alamat yayasan"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nomor Telepon <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nomor telepon"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image URL (Optional) */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Gambar (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan URL gambar"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
