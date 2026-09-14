"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export const EmptyProfileState = ({ session, userBetterAuth }: EmptyProfileStateProps) => {
  const router = useRouter();
  const hasFoundation = userBetterAuth?.foundation || userBetterAuth?.foundationId;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Hero Card with Session Info */}
        <Card className="shadow-xl border-2">
          <CardHeader className="text-center pb-4">
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                  {session?.user?.image || userBetterAuth?.image ? (
                    <Image
                      src={session.user?.image || userBetterAuth?.image}
                      alt={session.user?.name || userBetterAuth?.name || "Profile"}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                {/* Status Badge */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <Badge variant={hasFoundation ? "default" : "secondary"} className="shadow-md">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {hasFoundation ? "Menunggu Aktivasi" : "Belum Terdaftar"}
                  </Badge>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-2">
                <CardTitle className="text-2xl">
                  {session?.user?.name || userBetterAuth?.name || "Pengguna Baru"}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {session?.user?.email || userBetterAuth?.email || "Tidak ada email"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Info Alert */}
            <Alert variant={hasFoundation ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {hasFoundation ? "Menunggu Aktivasi Akun" : "Akun Belum Terdaftar"}
              </AlertTitle>
              <AlertDescription>
                {hasFoundation
                  ? "Anda sudah terdaftar di yayasan, tetapi profil Anda belum diaktifkan oleh administrator. Silakan hubungi administrator untuk melengkapi data profil Anda."
                  : "Anda sudah login, tetapi belum terdaftar di yayasan manapun. Silakan hubungi administrator atau daftar ke yayasan untuk melengkapi profil Anda."}
              </AlertDescription>
            </Alert>

            {/* Foundation Info Card (if exists) */}
            {hasFoundation && (
              <Card className="bg-success-surface border-success-border">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-success-strong">
                    <Building2 className="h-4 w-4" />
                    Informasi Yayasan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-success mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Nama Yayasan</p>
                      <p className="text-sm font-medium text-success-strong">
                        {userBetterAuth?.foundation?.name || "Loading..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Key className="h-4 w-4 text-success mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Kode Yayasan</p>
                      <p className="text-sm font-mono text-xs bg-background px-2 py-1 rounded text-success-strong">
                        {userBetterAuth?.foundation?.code || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Status Keanggotaan</p>
                      <Badge variant="default" className="bg-warning-solid text-xs">
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
                <CardTitle className="text-sm flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Informasi Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Nama</p>
                    <p className="text-sm font-medium">
                      {session?.user?.name || userBetterAuth?.name || "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium break-all">
                      {session?.user?.email || userBetterAuth?.email || "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Key className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="text-sm font-mono text-xs bg-background px-2 py-1 rounded">
                      {session?.user?.id || userBetterAuth?.id || "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                {(session?.user?.emailVerified || userBetterAuth?.emailVerified) && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Status Email</p>
                      <Badge variant="default" className="bg-success-solid text-xs">
                        Terverifikasi
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              {!hasFoundation && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/landing/register/foundation")}
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Daftar ke Yayasan
                </Button>
              )}

              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                <Building2 className="h-5 w-5 mr-2" />
                Kembali ke Dashboard
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
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
                <div className="w-12 h-12 rounded-full bg-info-chip flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-info" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-info-strong">
                  Langkah Selanjutnya
                </h3>
                <ul className="text-sm text-info-strong space-y-1 list-disc list-inside">
                  {hasFoundation ? (
                    <>
                      <li>Hubungi administrator yayasan Anda untuk aktivasi akun</li>
                      <li>Administrator akan melengkapi data profil Anda</li>
                      <li>Setelah diaktifkan, profil lengkap Anda akan muncul</li>
                    </>
                  ) : (
                    <>
                      <li>Daftar ke yayasan dengan kode yayasan yang valid</li>
                      <li>Atau hubungi administrator untuk pendaftaran manual</li>
                      <li>Setelah terdaftar, profil lengkap Anda akan muncul</li>
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
