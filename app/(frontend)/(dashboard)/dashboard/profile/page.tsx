"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/authClients";
import { useGetUserByIdBetterAuthProfile } from "@/app/(frontend)/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Shield, User, Mail, Phone, MapPin, Calendar, GraduationCap, Building2, Award, CheckCircle, Key, Users, BookOpen, School, AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type StatCardVariant = "default" | "success" | "warning" | "destructive";

interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | React.ReactNode;
  variant?: StatCardVariant;
}

interface DataTableProps {
  data: Record<string, any>;
  title: string;
  description?: string;
  Icon?: React.ReactNode;
}

interface DataRowProps {
  label: string;
  value: any;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const VARIANT_STYLES: Record<StatCardVariant, string> = {
  default: "bg-muted",
  success: "bg-success-surface border-success-border",
  warning: "bg-warning-surface border-warning-border",
  destructive: "bg-destructive-surface border-destructive-border",
};

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const isEmpty = (value: any): boolean => {
  return value === null || value === undefined || value === "N/A" || (typeof value === "string" && value.trim() === "");
};

const formatDate = (date: string | Date): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleString("id-ID", DATE_FORMAT_OPTIONS);
};

const formatValue = (val: any): React.ReactNode => {
  if (typeof val === "boolean") {
    return <Badge variant={val ? "default" : "secondary"}>{val ? "Yes" : "No"}</Badge>;
  }

  if (val instanceof Date || (typeof val === "string" && val.includes("T"))) {
    return formatDate(val);
  }

  if (Array.isArray(val)) {
    if (val.length === 0) {
      return <span className="text-muted-foreground text-sm">Empty array</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {val.map((item, idx) => (
          <Badge key={idx} variant="outline" className="text-xs">
            {String(item)}
          </Badge>
        ))}
      </div>
    );
  }

  if (typeof val === "object") {
    return <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-w-md">{JSON.stringify(val, null, 2)}</pre>;
  }

  return <span className="font-mono text-sm">{String(val)}</span>;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// Empty Profile State - When userData doesn't exist
interface EmptyProfileStateProps {
  session: any;
}

const EmptyProfileState = ({ session }: EmptyProfileStateProps) => {
  const router = useRouter();
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
                  {session?.user?.image ?
                    <Image src={session.user.image} alt={session.user.name || "Profile"} width={128} height={128} className="object-cover w-full h-full" />
                  : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                  }
                </div>
                {/* Status Badge */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <Badge variant="secondary" className="shadow-md">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Belum Terdaftar
                  </Badge>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-2">
                <CardTitle className="text-2xl">{session?.user?.name || "Pengguna Baru"}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {session?.user?.email || "Tidak ada email"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Akun Belum Terdaftar</AlertTitle>
              <AlertDescription>Anda sudah login, tetapi belum terdaftar di yayasan manapun. Silakan hubungi administrator atau daftar ke yayasan untuk melengkapi profil Anda.</AlertDescription>
            </Alert>

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
                    <p className="text-sm font-medium">{session?.user?.name || "Tidak tersedia"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium break-all">{session?.user?.email || "Tidak tersedia"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Key className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="text-sm font-mono text-xs bg-background px-2 py-1 rounded">{session?.user?.id || "Tidak tersedia"}</p>
                  </div>
                </div>

                {session?.user?.emailVerified && (
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
              <Button size="lg" className="w-full" onClick={() => router.push("/landing/register/foundation")}>
                <UserPlus className="h-5 w-5 mr-2" />
                Daftar ke Yayasan
              </Button>

              <Button size="lg" variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
                <Building2 className="h-5 w-5 mr-2" />
                Kembali ke Dashboard
              </Button>
            </div> 

            {/* Help Text */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Butuh bantuan?{" "}
                <a href="mailto:santosatechid@gmail.com" className="text-primary hover:underline">
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
                <h3 className="font-semibold text-info-strong">Langkah Selanjutnya</h3>
                <ul className="text-sm text-info-strong space-y-1 list-disc list-inside">
                  <li>Daftar ke yayasan dengan kode yayasan yang valid</li>
                  <li>Atau hubungi administrator untuk pendaftaran manual</li>
                  <li>Setelah terdaftar, profil lengkap Anda akan muncul</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const UserProfileSkeleton = ({ message }: { message?: string }) => (
  <div className="min-h-screen py-8 px-4">
    <div className="max-w-7xl mx-auto space-y-6">
      {message && <div className="text-center text-sm text-muted-foreground mb-4">{message}</div>}
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, variant = "default" }: StatCardProps) => {
  if (isEmpty(value)) return null;

  return (
    <Card className={VARIANT_STYLES[variant]}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold mt-1">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => {
  if (isEmpty(value)) return null;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
};

const DataRow = ({ label, value }: DataRowProps) => {
  if (isEmpty(value)) return null;

  return (
    <TableRow>
      <TableHead className="w-50 font-medium">{label}</TableHead>
      <TableCell>{formatValue(value)}</TableCell>
    </TableRow>
  );
};

const DataTable = ({ data, title, description, Icon }: DataTableProps) => {
  const entries = Object.entries(data).filter(([_, value]) => !isEmpty(value));

  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {entries.map(([key, value]) => (
              <DataRow key={key} label={key} value={value} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const UserHeroSection = ({ user }: { user: any }) => (
  <Card className="border-2 shadow-lg">
    <CardHeader className="pb-4">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {user?.avatarUrl && (
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-xl ring-4 ring-primary/20">
              <Image src={user.avatarUrl} alt={user?.name || "User Avatar"} width={128} height={128} className="w-full h-full object-cover" priority />
            </div>
            {user?.isActive && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success-solid rounded-full border-4 border-background flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        )}
        <div className="flex-1 text-center md:text-left">
          <CardTitle className="text-3xl md:text-4xl mb-2">{user?.name || "User"}</CardTitle>
          <CardDescription className="text-lg mb-4">{user?.email}</CardDescription>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {user?.role?.name && (
              <Badge variant="default" className="text-sm px-3 py-1">
                <Shield className="h-3 w-3 mr-1" />
                {user.role.name}
              </Badge>
            )}
            {user?.isActive !== undefined && (
              <Badge variant={user.isActive ? "default" : "destructive"} className="text-sm px-3 py-1">
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </CardHeader>
  </Card>
);

const PersonalInformationCard = ({ data }: { data: any }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="h-5 w-5" />
        Personal Information
      </CardTitle>
      <CardDescription>Basic personal details and contact information</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoItem icon={Mail} label="Email" value={data.email} />
        <InfoItem icon={Phone} label="Parent Phone" value={data.parentPhone} />
        <InfoItem icon={MapPin} label="Address" value={data.address} />
        <InfoItem icon={Calendar} label="Birth Date" value={data.birthDate ? formatDate(data.birthDate) : null} />
        <InfoItem icon={MapPin} label="Birth Place" value={data.birthPlace} />
        <InfoItem icon={User} label="Gender" value={data.gender} />
      </div>
    </CardContent>
  </Card>
);

const AcademicInformationCard = ({ data }: { data: any }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5" />
        Academic Information
      </CardTitle>
      <CardDescription>Academic details and enrollment information</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoItem icon={Key} label="NIK" value={data.nik} />
        <InfoItem icon={Key} label="NISN" value={data.nisn} />
        <InfoItem icon={Calendar} label="Enrollment Date" value={data.enrollmentDate ? formatDate(data.enrollmentDate) : null} />
        <InfoItem icon={Calendar} label="Start Date" value={data.startDate ? formatDate(data.startDate) : null} />
        <InfoItem icon={Calendar} label="End Date" value={data.endDate ? formatDate(data.endDate) : null} />
        <InfoItem icon={Calendar} label="Graduation Date" value={data.graduationDate ? formatDate(data.graduationDate) : null} />
      </div>
    </CardContent>
  </Card>
);

const ProfessionalInformationCard = ({ data }: { data: any }) => {
  if (!data.employeeId && !data.position && !data.relation) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Professional Information
        </CardTitle>
        <CardDescription>Work-related details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoItem icon={Key} label="Employee ID" value={data.employeeId} />
          <InfoItem icon={Award} label="Position" value={data.position} />
          <InfoItem icon={Users} label="Relation" value={data.relation} />
        </div>
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function Home() {
  const { data: session } = useSession();
  const [isSessionReady, setIsSessionReady] = React.useState(false);
  const { data: user, isPending: userLoading, isError: userError } = useGetUserByIdBetterAuthProfile(session?.user?.id ?? "");
  const router = useRouter();
  const [redirecting, setRedirecting] = React.useState(false);

  // Mark session as ready after first render with small delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsSessionReady(true);
    }, 100); // Small delay to ensure session is properly loaded
    return () => clearTimeout(timer);
  }, []);

  // Redirect logic - only redirect if no session (not authenticated)
  React.useEffect(() => {
    // Prevent multiple redirects
    if (redirecting) return;

    // Wait for session to be ready
    if (!isSessionReady) {
      console.log("Session not ready yet...");
      return;
    }

    // If no session after it's ready, redirect to sign-in
    // if (!session?.user?.id) {
    //   console.log("No session found, redirecting to sign-in");
    //   setRedirecting(true);
    //   router.push("/auth/sign-in");
    //   return;
    // }

    // Wait for user data to finish loading
    if (userLoading) {
      console.log("User data still loading...");
      return;
    }

    // Don't auto-redirect if userData doesn't exist
    // We'll show EmptyProfileState instead
    console.log("All checks passed, showing profile or empty state");
  }, [isSessionReady, session, userLoading, router, redirecting]);

  // Show loading while session is not ready, user data is loading, or redirecting
  if (!isSessionReady) {
    return <UserProfileSkeleton message="Initializing session..." />;
  }

  if (userLoading) {
    return <UserProfileSkeleton message="Loading profile data..." />;
  }

  if (redirecting) {
    return <UserProfileSkeleton message="Redirecting..." />;
  }

  // Show loading if no session (will redirect via useEffect)
  if (!session?.user?.id) {
    return <UserProfileSkeleton message="Authentication required..." />;
  }

  // Show loading if user data failed to load (will redirect via useEffect)
  if (userError) {
    return <UserProfileSkeleton message="Setting up your account..." />;
  }

  // Show loading if user is null (shouldn't happen if no error and not loading)
  if (!user) {
    // If we have session but no user data, show EmptyProfileState
    if (session?.user?.id) {
      return <EmptyProfileState session={session} />;
    }
    return <UserProfileSkeleton message="Loading user data..." />;
  }

  // If user exists but no foundation, show EmptyProfileState
  if (!user.foundation) {
    return <EmptyProfileState session={session} />;
  }

  // Extract nested objects
  const { class: classData, major, foundation, academicYear, role, ...mainData } = user;

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/20 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <UserHeroSection user={user} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={School} label="Yayasan" value={foundation?.name} />
          <StatCard icon={School} label="Class" value={classData?.name} />
          <StatCard icon={BookOpen} label="Major" value={major?.name} />
          <StatCard icon={Calendar} label="Academic Year" value={academicYear?.year} />
          <StatCard icon={Users} label="Role" value={role?.name} />
        </div>

        {/* Personal Information */}
        <PersonalInformationCard data={mainData} />

        {/* Academic Information */}
        <AcademicInformationCard data={mainData} />

        {/* Professional Information */}
        <ProfessionalInformationCard data={mainData} />
      </div>
    </div>
  );
}
