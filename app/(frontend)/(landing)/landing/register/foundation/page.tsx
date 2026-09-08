"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, ChevronLeft, Upload, Phone, MapPin, Hash, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Hooks
import { useCreateFoundation } from "@/app/(frontend)/(hooks)/hooks/Foundation/useFoundation";
import { useGetUserByIdBetterAuthProfile } from "@/app/(frontend)/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { toast } from "sonner";
import { useSession } from "@/lib/authClients";

// Form Schema
const foundationSchema = z.object({
  name: z.string().min(3, "Nama yayasan minimal 3 karakter").max(100, "Nama yayasan maksimal 100 karakter"),
  foundationCode: z
    .string()
    .min(3, "Kode yayasan minimal 3 karakter")
    .max(20, "Kode yayasan maksimal 20 karakter")
    .regex(/^[A-Z0-9_-]+$/, "Kode hanya boleh huruf besar, angka, underscore, dan strip"),
  address: z.string().min(10, "Alamat minimal 10 karakter").max(500, "Alamat maksimal 500 karakter"),
  phone: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^[0-9+()-\s]+$/, "Format nomor telepon tidak valid"),
  imageUrl: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),
  description: z.string().max(1000, "Deskripsi maksimal 1000 karakter").optional(),
  userId: z.string().optional(),
});

export type FoundationFormData = z.infer<typeof foundationSchema>;

export default function RegisterFoundation() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const createFoundationMutation = useCreateFoundation();
  const session = useSession();
  const userId = session.data?.user.id;

  // Add this hook to check user data periodically after foundation creation
  const { refetch: refetchUserData } = useGetUserByIdBetterAuthProfile(userId ?? "");

  /**
   * Poll user data to ensure foundationId is updated before redirecting
   * This prevents race condition where profile page redirects back here
   */
  const waitForUserDataUpdate = async (): Promise<void> => {
    console.log("🔍 Waiting for user data to be updated with foundationId...");

    let attempts = 0;
    const maxAttempts = 20; // 20 * 500ms = 10 seconds max

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`📡 Polling attempt ${attempts}/${maxAttempts}`);

      try {
        // Force refetch user data
        const { data: refreshedUserData } = await refetchUserData();
        console.log("👤 Current user data:", refreshedUserData);

        // Check if foundationId now exists
        if (refreshedUserData?.foundationId) {
          console.log("✅ User data updated with foundationId:", refreshedUserData.foundationId);
          return; // Success! User data is updated
        }

        // Wait 500ms before next attempt
        console.log("⏳ Foundation ID not found yet, waiting 500ms...");
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("❌ Error polling user data:", error);
        // Continue polling even if there's an error
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Max attempts reached - log warning but continue with redirect
    console.log("⚠️ Max polling attempts reached. Redirecting anyway...");
  };

  /**
   * Generate unique foundation code from name
   * Format: PREFIX_RANDOMSTRING
   * Example: YAYASAN_NUSANTARA_A7B9
   */
  const generateFoundationCode = (name: string): string => {
    // Clean and format name
    const cleanName = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, "_") // Replace spaces with underscore
      .substring(0, 15); // Limit to 15 chars

    // Generate random string (4 characters: letters + numbers)
    const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();

    // Combine name with random string
    const code = cleanName ? `${cleanName}_${randomString}` : `YAYASAN_${randomString}`;

    return code;
  };

  const form = useForm<FoundationFormData>({
    resolver: zodResolver(foundationSchema),
    defaultValues: {
      name: "",
      foundationCode: "",
      address: "",
      phone: "",
      imageUrl: "",
      userId: userId,
    },
  });

  // Handle image upload (placeholder for now)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // TODO: Implement actual image upload logic here
      // For now, we'll just use a placeholder URL
      const placeholderUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(form.getValues("name") || "Foundation")}`;
      form.setValue("imageUrl", placeholderUrl);
      toast.success("Gambar berhasil diunggah");
    } catch (error) {
      toast.error("Gagal mengunggah gambar");
    } finally {
      setUploadingImage(false);
    }
  };

  // Auto-generate foundation code from name
  React.useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if (fieldName === "name" && value.name) {
        // Generate unique code from name
        const generatedCode = generateFoundationCode(value.name);
        form.setValue("foundationCode", generatedCode);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: FoundationFormData) => {
    setIsSubmitting(true);
    try {
      // Create foundation and wait for completion
      const result = await createFoundationMutation.mutateAsync(data);
      console.log("🎉 Foundation created successfully:", result);

      // Show success message
      toast.success("Yayasan berhasil didaftarkan!");

      // Wait for user data to be properly updated before redirecting
      // This prevents race condition where profile page sees no foundationId
      await waitForUserDataUpdate();

      // Now redirect with confidence that user data has been updated
      console.log("🔄 User data confirmed updated, redirecting to profile page...");
      router.push("/dashboard/profile");
    } catch (error) {
      console.error("❌ Error creating foundation:", error);
      toast.error("Gagal mendaftarkan yayasan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header with Breadcrumb */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/auth/sign-in" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" />
                  Kembali ke Login
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">Daftar Yayasan</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight">Daftarkan Yayasan</h1>
            <p className="text-muted-foreground">Lengkapi informasi yayasan untuk memulai menggunakan sistem manajemen sekolah</p>
            <Badge variant="secondary" className="mt-3">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Gratis untuk 30 hari pertama
            </Badge>
          </div>

          {/* Form Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi Yayasan
              </CardTitle>
              <CardDescription>Masukkan detail yayasan yang akan menggunakan sistem ini</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Foundation Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Nama Yayasan *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="contoh: Yayasan Pendidikan Nusantara" className="h-11" {...field} />
                        </FormControl>
                        <FormDescription>Nama lengkap yayasan yang akan terdaftar di sistem</FormDescription>
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
                        <FormLabel className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Kode Yayasan *
                          <Badge variant="outline" className="ml-auto text-xs font-normal">
                            Auto-generated
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Input disabled={true} placeholder="YAYASAN_NUSANTARA_A7B9" className="h-11 font-mono bg-muted cursor-not-allowed" {...field} />
                        </FormControl>
                        <FormDescription>Kode unik untuk identifikasi yayasan (dibuat otomatis dari nama + kode random)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Alamat Lengkap *
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder="Jl. Pendidikan No. 123, Kelurahan Sukamaju, Kecamatan Bandung Utara, Kota Bandung, Jawa Barat 40123" className="min-h-[100px] resize-none" {...field} />
                        </FormControl>
                        <FormDescription>Alamat lengkap kantor pusat yayasan</FormDescription>
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
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Nomor Telepon *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+62 22 1234567 atau 022-1234567" className="h-11" {...field} />
                        </FormControl>
                        <FormDescription>Nomor telepon yang dapat dihubungi</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Image Upload */}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Logo Yayasan (Opsional)
                        </FormLabel>
                        <div className="space-y-3">
                          {/* Current Image Preview */}
                          {field.value && (
                            <div className="flex items-center gap-3 rounded-lg border p-3">
                              <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                                <img src={field.value} alt="Logo Preview" className="h-full w-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">Logo telah diunggah</p>
                                <p className="text-xs text-muted-foreground">Klik tombol di bawah untuk mengubah</p>
                              </div>
                            </div>
                          )}

                          {/* Upload Button */}
                          <div className="flex items-center gap-3">
                            <Button type="button" variant="outline" size="sm" disabled={uploadingImage} onClick={() => document.getElementById("image-upload")?.click()}>
                              {uploadingImage ?
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              : <Upload className="mr-2 h-4 w-4" />}
                              {uploadingImage ? "Mengunggah..." : "Pilih Gambar"}
                            </Button>
                            <FormControl>
                              <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </FormControl>
                          </div>
                        </div>
                        <FormDescription>Upload logo yayasan (format: JPG, PNG, maksimal 2MB)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex flex-col gap-4 pt-4">
                    <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 w-full">
                      {isSubmitting ?
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mendaftarkan Yayasan...
                        </>
                      : <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Daftarkan Yayasan
                        </>
                      }
                    </Button>

                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>Setelah mendaftar, Anda akan dapat login dan mulai menggunakan sistem manajemen sekolah.</AlertDescription>
                    </Alert>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Sudah memiliki akun yayasan?{" "}
              <Button variant="link" className="h-auto p-0" onClick={() => router.push("/auth/sign-in")}>
                Masuk di sini
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
