"use client";
import { useState, useEffect, ChangeEvent } from "react";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FieldGroup,
  Sheet,
  SheetActions,
  SheetHeading,
  SheetMasthead,
  SheetPage,
} from "@/components/entry/Sheet";

// Hooks
import {
  useCreateFoundation,
  useFoundationAssignUser,
} from "@/app/(hooks)/hooks/Foundation/useFoundation";
import { useGetUserByIdBetterAuthProfile } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { toast } from "sonner";
import { useSession } from "@/lib/authClients";
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

/** Wait between polls without holding the event loop's executor form open. */
const delay = (ms: number): Promise<void> => {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
};

/* Field labels are set as a printed form sets them — sentence case, one weight
   up from the value beneath. See DESIGN.md §3. */
const LABEL = "text-secondary-foreground text-[13px] font-medium";

/* The mode selector sits on the sheet's top edge as two cells, the active one
   marked by the rule under it. */
const MODE =
  "text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground h-auto flex-1 items-center justify-center rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 py-3 text-[13px] font-medium whitespace-nowrap shadow-none transition-colors data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:flex-none sm:px-5";

export default function RegisterFoundation() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
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
        await delay(500);
      } catch (error) {
        console.error("❌ Error polling user data:", error);
        // Continue polling even if there's an error
        await delay(500);
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
  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // TODO: Implement actual image upload logic here
      // For now, we'll just use a placeholder URL
      const placeholderUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(form.getValues("name") || "Foundation")}`;
      form.setValue("imageUrl", placeholderUrl);
      toast.success("Gambar berhasil diunggah");
    } catch {
      toast.error("Gagal mengunggah gambar");
    } finally {
      setUploadingImage(false);
    }
  };

  // Auto-generate foundation code from name
  useEffect(() => {
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
  useEffect(() => {
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
    <SheetPage>
      <SheetMasthead label="PENDAFTARAN YAYASAN" />

      {session.data?.user && (
        <p className="text-muted-foreground mt-3 text-xs">
          Mendaftar sebagai{" "}
          <span className="text-foreground font-medium">
            {session.data.user.name}
          </span>
          {session.data.user.email ? ` (${session.data.user.email})` : ""}
        </p>
      )}

      <Sheet>
        <Tabs defaultValue="register" className="gap-0">
          <TabsList className="border-border h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger value="register" className={MODE}>
              Yayasan baru
            </TabsTrigger>
            <TabsTrigger value="inputID" className={MODE}>
              Kode yayasan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <SheetHeading
              title="Daftarkan yayasan Anda"
              description="Isi identitas yayasan. Kode yayasan dibuat otomatis dari namanya, dan dipakai pengguna lain untuk masuk ke yayasan ini."
            />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup label="IDENTITAS YAYASAN">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={LABEL}>Nama yayasan *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Yayasan Pendidikan Nusantara"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Nama resmi yayasan. Tercetak pada rapor siswa.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="foundationCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={LABEL}>Kode yayasan *</FormLabel>
                        <FormControl>
                          <Input
                            disabled
                            placeholder="YAYASAN_NUSANTARA_A7B9"
                            className="bg-muted h-11 font-mono text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Dibuat otomatis dari nama yayasan. Bagikan kode ini
                          kepada guru, siswa, dan orang tua agar akun mereka
                          masuk ke yayasan ini.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldGroup>

                <FieldGroup label="ALAMAT & KONTAK">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={LABEL}>Alamat lengkap *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Jl. Pendidikan No. 123, Bandung 40123"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Alamat kantor pusat yayasan.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={LABEL}>Nomor telepon *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+62 22 1234567"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Nomor yang dapat dihubungi cabang dan orang tua.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldGroup>

                <FieldGroup label="LOGO YAYASAN (OPSIONAL)">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={LABEL}>Logo yayasan</FormLabel>
                        <div className="space-y-3">
                          {field.value && (
                            <div className="border-border flex items-center gap-3 border px-3 py-2">
                              <span className="bg-muted h-12 w-12 overflow-hidden rounded-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={field.value}
                                  alt="Pratinjau logo yayasan"
                                  className="h-full w-full object-cover"
                                />
                              </span>
                              <span className="text-xs">
                                Logo terpasang. Pilih gambar lain untuk
                                menggantinya.
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={uploadingImage}
                              onClick={() =>
                                document.getElementById("image-upload")?.click()
                              }
                            >
                              {uploadingImage ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <Upload />
                              )}
                              {uploadingImage ? "Mengunggah..." : "Pilih gambar"}
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
                        <FormDescription className="text-xs">
                          Format JPG atau PNG, maksimal 2MB.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldGroup>

                <SheetActions aside="Setelah terdaftar, Anda diarahkan ke profil untuk melengkapi data.">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Mendaftarkan...
                      </>
                    ) : (
                      "Daftarkan yayasan"
                    )}
                  </Button>
                </SheetActions>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="inputID">
            <SheetHeading
              title="Gabung dengan kode yayasan"
              description="Masukkan kode yayasan yang diberikan admin. Akun ini langsung terhubung ke yayasan tersebut."
            />

            <Form {...codeForm}>
              <form onSubmit={codeForm.handleSubmit(handleInputCodeFoundation)}>
                <FieldGroup label="KODE YAYASAN">
                  <FormField
                    control={codeForm.control}
                    name="foundationCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={LABEL}>Kode yayasan *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="YAYASAN_NUSANTARA_A7B9"
                            autoComplete="off"
                            className="h-11 font-mono text-xs uppercase"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Contoh format: YAYASAN_NUSANTARA_A7B9. Minta kode ini
                          dari admin yayasan.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldGroup>

                <SheetActions>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isJoining}
                    className="w-full sm:w-auto"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Bergabung...
                      </>
                    ) : (
                      "Gabung dengan yayasan"
                    )}
                  </Button>
                </SheetActions>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </Sheet>

      <p className="text-muted-foreground mt-4 text-xs">
        Sudah memiliki akun yayasan?{" "}
        <Link
          href="/auth/sign-in"
          className="text-primary rounded-sm font-medium underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Masuk
        </Link>
      </p>

      {/* DEBUG: Show form values in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="border-border bg-card mt-3 border px-4 py-3">
          <p className="text-muted-foreground font-mono text-[11px]">
            debug: form.watch()
          </p>
          <pre className="text-muted-foreground mt-2 overflow-x-auto font-mono text-[11px]">
            {JSON.stringify(form.watch(), null, 2)}
          </pre>
        </div>
      )}
    </SheetPage>
  );
}
