"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Building2,
  ChevronLeft,
  Upload,
  Phone,
  MapPin,
  Hash,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Hooks
import {
  useCreateFoundation,
  useFoundationAssignUser,
} from "@/app/(hooks)/hooks/Foundation/useFoundation";
import { useGetUserByIdBetterAuthProfile } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { toast } from "sonner";
import { useSession } from "@/lib/authClients";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// Form Schema untuk Daftarkan Yayasan
const foundationSchema = z.object({
  name: z
    .string()
    .min(3, "Nama yayasan minimal 3 karakter")
    .max(100, "Nama yayasan maksimal 100 karakter"),
  foundationCode: z
    .string()
    .min(3, "Kode yayasan minimal 3 karakter")
    .max(20, "Kode yayasan maksimal 20 karakter")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Kode hanya boleh huruf besar, angka, underscore, dan strip",
    ),
  address: z
    .string()
    .min(10, "Alamat minimal 10 karakter")
    .max(500, "Alamat maksimal 500 karakter"),
  phone: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^[0-9+()-\s]+$/, "Format nomor telepon tidak valid"),
  imageUrl: z
    .string()
    .url("URL gambar tidak valid")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional(),
  userId: z.string().optional(),
});

// Form Schema untuk Masuk dengan Code Yayasan
const foundationCodeSchema = z.object({
  foundationCode: z
    .string()
    .min(3, "Code yayasan minimal 3 karakter")
    .max(30, "Code yayasan maksimal 30 karakter")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Code hanya boleh huruf besar, angka, underscore, dan strip",
    )
    .refine((code) => code.includes("_"), {
      message:
        "Format code yayasan tidak valid. Contoh: YAYASAN_NUSANTARA_A7B9",
    }),
});

export type FoundationFormData = z.infer<typeof foundationSchema>;
export type FoundationCodeFormData = z.infer<typeof foundationCodeSchema>;

export default function RegisterFoundation() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [isJoining, setIsJoining] = React.useState(false);
  const createFoundationMutation = useCreateFoundation();
  const foundationAssignUserMutation = useFoundationAssignUser();
  const session = useSession();
  const userId = session.data?.user.id;

  // Add this hook to check user data periodically after foundation creation
  const { refetch: refetchUserData } = useGetUserByIdBetterAuthProfile(
    userId ?? "",
  );

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
          console.log(
            "✅ User data updated with foundationId:",
            refreshedUserData.foundationId,
          );
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
    const randomString = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();

    // Combine name with random string
    const code = cleanName
      ? `${cleanName}_${randomString}`
      : `YAYASAN_${randomString}`;

    return code;
  };

  // Form untuk Daftarkan Yayasan
  const form = useForm<FoundationFormData>({
    resolver: zodResolver(foundationSchema),
    defaultValues: {
      name: "",
      foundationCode: "",
      address: "",
      phone: "",
      imageUrl: "",
      userId: userId || "",
    },
  });

  // Form untuk Masuk dengan Code Yayasan
  const codeForm = useForm<FoundationCodeFormData>({
    resolver: zodResolver(foundationCodeSchema),
    defaultValues: {
      foundationCode: "",
    },
  });

  // Handle image upload (placeholder for now)
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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

  // Update userId in form when session is available
  React.useEffect(() => {
    if (userId) {
      form.setValue("userId", userId);
    }
  }, [userId, form]);

  const onSubmit = async (data: FoundationFormData) => {
    if (!userId) {
      toast.error("User ID tidak tersedia. Silakan login kembali.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure userId is included in the data
      const dataWithUserId = { ...data, userId };

      console.log(dataWithUserId);

      // Create foundation and wait for completion
      const result = await createFoundationMutation.mutateAsync(dataWithUserId);
      console.log("🎉 Foundation created successfully:", result);

      // Show success message
      toast.success("Yayasan berhasil didaftarkan!");

      // Wait for user data to be properly updated before redirecting
      // This prevents race condition where profile page sees no foundationId
      await waitForUserDataUpdate();

      // Now redirect with confidence that user data has been updated
      console.log(
        "🔄 User data confirmed updated, redirecting to profile page...",
      );
      router.push("/dashboard/profile");
    } catch (error) {
      console.error("❌ Error creating foundation:", error);
      toast.error("Gagal mendaftarkan yayasan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputCodeFoundation = async (data: FoundationCodeFormData) => {
    if (!userId) {
      toast.error("User ID tidak tersedia. Silakan login kembali.");
      router.push("/auth/sign-in");
      return;
    }

    setIsJoining(true);
    try {
      // Use the mutation defined at component level (not inside this function!)
      await foundationAssignUserMutation.mutateAsync({
        userId: userId,
        foundationCode: data.foundationCode,
      });

      // Success handling is done in the mutation's onSuccess
      router.push("/dashboard/profile");
      console.log(
        "🎉 Successfully joined foundation with code:",
        data.foundationCode,
      );
    } catch (error) {
      console.error("❌ Error joining foundation:", error);
      // Error handling is done in the mutation's onError
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header with Breadcrumb */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1.5 text-xs font-medium text-secondary-foreground shadow-xs backdrop-blur-md transition-all hover:border-primary/40 hover:bg-background hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto w-full max-w-2xl">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ">
              <Building2 className="h-8 w-8 text-info" />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              Daftarkan Yayasan
            </h1>
            <p className="text-muted-foreground">
              Lengkapi informasi yayasan untuk memulai menggunakan sistem
              manajemen sekolah
            </p>
            <Badge variant="secondary" className="mt-3">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Gratis untuk 30 hari pertama
            </Badge>
          </div>

          {/* User Info Section */}
          {session.data?.user && (
            <div className="mb-6">
              <Card className="bg-muted/50">
                <CardContent className="">
                  <div className="flex items-center gap-3">
                    {session.data.user.image && (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-background shadow-sm">
                        <Image
                          src={session.data.user.image}
                          alt={session.data.user.name || "User Avatar"}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">Mendaftar sebagai:</p>
                      <p className="text-lg font-semibold">
                        {session.data.user.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.data.user.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <Tabs defaultValue="register" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="register" className="flex-1">
                  Daftarkan Yayasan
                </TabsTrigger>
                <TabsTrigger value="inputID" className="flex-1">
                  Masuk Dengan Code Yayasan
                </TabsTrigger>
              </TabsList>
              <TabsContent value="register">
                {" "}
                {/* Form Card */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Informasi Yayasan
                    </CardTitle>
                    <CardDescription>
                      Masukkan detail yayasan yang akan menggunakan sistem ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
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
                                <Input
                                  placeholder="contoh: Yayasan Pendidikan Nusantara"
                                  className="h-11"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Nama lengkap yayasan yang akan terdaftar di
                                sistem
                              </FormDescription>
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
                                <Badge
                                  variant="outline"
                                  className="ml-auto text-xs font-normal"
                                >
                                  Auto-generated
                                </Badge>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  disabled={true}
                                  placeholder="YAYASAN_NUSANTARA_A7B9"
                                  className="h-11 font-mono bg-muted cursor-not-allowed"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Kode unik untuk identifikasi yayasan (dibuat
                                otomatis dari nama + kode random)
                              </FormDescription>
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
                                <Textarea
                                  placeholder="Jl. Pendidikan No. 123, Kelurahan Sukamaju, Kecamatan Bandung Utara, Kota Bandung, Jawa Barat 40123"
                                  className="min-h-[100px] resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Alamat lengkap kantor pusat yayasan
                              </FormDescription>
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
                                <Input
                                  placeholder="+62 22 1234567 atau 022-1234567"
                                  className="h-11"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Nomor telepon yang dapat dihubungi
                              </FormDescription>
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
                                      <img
                                        src={field.value}
                                        alt="Logo Preview"
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        Logo telah diunggah
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Klik tombol di bawah untuk mengubah
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Upload Button */}
                                <div className="flex items-center gap-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={uploadingImage}
                                    onClick={() =>
                                      document
                                        .getElementById("image-upload")
                                        ?.click()
                                    }
                                  >
                                    {uploadingImage ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Upload className="mr-2 h-4 w-4" />
                                    )}
                                    {uploadingImage
                                      ? "Mengunggah..."
                                      : "Pilih Gambar"}
                                  </Button>
                                  <FormControl>
                                    <Input
                                      id="image-upload"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={handleImageUpload}
                                    />
                                  </FormControl>
                                </div>
                              </div>
                              <FormDescription>
                                Upload logo yayasan (format: JPG, PNG, maksimal
                                2MB)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Submit Button */}
                        <div className="flex flex-col gap-4 pt-4">
                          {/* DEBUG: Show form values in development */}
                          {process.env.NODE_ENV === "development" && (
                            <div className="p-4 bg-muted rounded-lg text-xs">
                              <p className="font-bold mb-2">
                                🐛 Debug - Form Values:
                              </p>
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(form.watch(), null, 2)}
                              </pre>
                            </div>
                          )}

                          <Button
                            type="submit"
                            size="lg"
                            disabled={isSubmitting}
                            className="h-12 w-full"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mendaftarkan Yayasan...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Daftarkan Yayasan
                              </>
                            )}
                          </Button>

                          <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                              Setelah mendaftar, Anda akan dapat login dan mulai
                              menggunakan sistem manajemen sekolah.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="inputID">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Masuk dengan Code Yayasan
                    </CardTitle>
                    <CardDescription>
                      Masukkan code yayasan yang sudah terdaftar untuk bergabung
                      dengan yayasan tersebut
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...codeForm}>
                      <form
                        onSubmit={codeForm.handleSubmit(
                          handleInputCodeFoundation,
                        )}
                        className="space-y-4"
                      >
                        {/* Foundation Code Input */}
                        <FormField
                          control={codeForm.control}
                          name="foundationCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                Code Yayasan *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="YAYASAN_NUSANTARA_A7B9"
                                  className="h-11 font-mono uppercase"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.value.toUpperCase())
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                Masukkan code yayasan yang diberikan oleh admin
                                yayasan. Format: NAMA_YAYASAN_KODE (contoh:
                                YAYASAN_NUSANTARA_A7B9)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Submit Button */}
                        <div className="flex flex-col gap-4 pt-2">
                          <Button
                            type="submit"
                            size="lg"
                            disabled={isJoining}
                            className="h-12 w-full"
                          >
                            {isJoining ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Bergabung dengan Yayasan...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Masuk dengan Code Yayasan
                              </>
                            )}
                          </Button>

                          <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                              Dengan memasukkan code yayasan, Anda akan
                              bergabung dengan yayasan yang sudah terdaftar di
                              sistem.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Sudah memiliki akun yayasan?{" "}
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() => router.push("/auth/sign-in")}
              >
                Masuk di sini
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
