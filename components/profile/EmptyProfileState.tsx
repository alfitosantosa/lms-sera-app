"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  User,
  Mail,
  AlertCircle,
  Building2,
  Key,
  CheckCircle,
  UserPlus,
} from "lucide-react";

interface EmptyProfileStateProps {
  session: any;
  userBetterAuth?: any;
}

export const EmptyProfileState = ({
  session,
  userBetterAuth,
}: EmptyProfileStateProps) => {
  const router = useRouter();

  // Tentukan kondisi berdasarkan foundationId dan userData
  const isWaitingForAdminId = !!userBetterAuth?.foundationId;
  const hasUserData = !!userBetterAuth?.userData;

  // CASE 1: No foundation + No userData = Belum terdaftar, harus daftar
  // CASE 2: Has foundation + No userData = Sudah terdaftar, menunggu admin assign
  const isWaitingForAdmin = isWaitingForAdminId && !hasUserData;
  const needsRegistration = !isWaitingForAdminId && !hasUserData;

  return (
    <div className="from-background via-muted/20 to-background min-h-screen bg-gradient-to-br px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Hero Card with Session Info */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="pb-4 text-center">
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Photo */}
              <div className="relative">
                <div className="border-primary/20 h-32 w-32 overflow-hidden rounded-full border-4 shadow-lg">
                  {session?.user?.image || userBetterAuth?.image ? (
                    <Image
                      src={session.user?.image || userBetterAuth?.image}
                      alt={
                        session.user?.name || userBetterAuth?.name || "Profile"
                      }
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="from-primary/20 to-primary/5 flex h-full w-full items-center justify-center bg-gradient-to-br">
                      <User className="text-muted-foreground h-16 w-16" />
                    </div>
                  )}
                </div>
                {/* Status Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform">
                  <Badge
                    variant={isWaitingForAdmin ? "default" : "secondary"}
                    className="shadow-md"
                  >
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {isWaitingForAdmin
                      ? "Menunggu Aktivasi"
                      : "Belum Terdaftar"}
                  </Badge>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-2">
                <CardTitle className="text-2xl">
                  {session?.user?.name ||
                    userBetterAuth?.name ||
                    "Pengguna Baru"}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {session?.user?.email ||
                    userBetterAuth?.email ||
                    "Tidak ada email"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Info Alert */}
            <Alert variant={isWaitingForAdmin ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {isWaitingForAdmin
                  ? "Menunggu Aktivasi Akun"
                  : "Akun Belum Terdaftar"}
              </AlertTitle>
              <AlertDescription>
                {isWaitingForAdmin
                  ? "Anda sudah terdaftar di yayasan, tetapi profil Anda belum diaktifkan oleh administrator. Silakan hubungi administrator untuk melengkapi data profil Anda."
                  : "Anda sudah login, tetapi belum terdaftar di yayasan manapun. Silakan hubungi administrator atau daftar ke yayasan untuk melengkapi profil Anda."}
              </AlertDescription>
            </Alert>

            {/* Foundation Info Card (if exists) */}
            {isWaitingForAdmin && (
              <Card className="bg-success-surface border-success-border">
                <CardHeader>
                  <CardTitle className="text-success-strong flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4" />
                    Informasi Yayasan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="text-success mt-0.5 h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">
                        Nama Yayasan
                      </p>
                      <p className="text-success-strong text-sm font-medium">
                        {userBetterAuth?.foundation?.name || "Loading..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Key className="text-success mt-0.5 h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">
                        Kode Yayasan
                      </p>
                      <p className="bg-background text-success-strong rounded px-2 py-1 font-mono text-sm text-xs">
                        {userBetterAuth?.foundation?.foundationCode || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">
                        Status Keanggotaan
                      </p>
                      <Badge
                        variant="default"
                        className="bg-warning-solid text-xs"
                      >
                        Menunggu Aktivasi
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session Details Card */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Key className="h-4 w-4" />
                  Informasi Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Nama</p>
                    <p className="text-sm font-medium">
                      {session?.user?.name ||
                        userBetterAuth?.name ||
                        "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="text-sm font-medium break-all">
                      {session?.user?.email ||
                        userBetterAuth?.email ||
                        "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Key className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">User ID</p>
                    <p className="bg-background rounded px-2 py-1 font-mono text-sm text-xs">
                      {session?.user?.id ||
                        userBetterAuth?.id ||
                        "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                {(session?.user?.emailVerified ||
                  userBetterAuth?.emailVerified) && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs">
                        Status Email
                      </p>
                      <Badge
                        variant="default"
                        className="bg-success-solid text-xs"
                      >
                        Terverifikasi
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              {!isWaitingForAdmin && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/landing/register/foundation")}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Daftar ke Yayasan
                </Button>
              )}

              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                <Building2 className="mr-2 h-5 w-5" />
                Kembali ke Dashboard
              </Button>
            </div>

            {/* Help Text */}
            <div className="border-t pt-4 text-center">
              <p className="text-muted-foreground text-sm">
                Butuh bantuan?{" "}
                <a
                  href="mailto:santosatechid@gmail.com"
                  className="text-primary hover:underline"
                >
                  Hubungi Administrator
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="bg-info-surface border-info-border">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="bg-info-chip flex h-12 w-12 items-center justify-center rounded-full">
                  <AlertCircle className="text-info h-6 w-6" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-info-strong font-semibold">
                  Langkah Selanjutnya
                </h3>
                <ul className="text-info-strong list-inside list-disc space-y-1 text-sm">
                  {isWaitingForAdmin ? (
                    <>
                      <li>
                        Hubungi administrator yayasan Anda untuk aktivasi akun
                      </li>
                      <li>Administrator akan melengkapi data profil Anda</li>
                      <li>
                        Setelah diaktifkan, profil lengkap Anda akan muncul
                      </li>
                    </>
                  ) : (
                    <>
                      <li>Daftar ke yayasan dengan kode yayasan yang valid</li>
                      <li>
                        Atau hubungi administrator untuk pendaftaran manual
                      </li>
                      <li>
                        Setelah terdaftar, profil lengkap Anda akan muncul
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
