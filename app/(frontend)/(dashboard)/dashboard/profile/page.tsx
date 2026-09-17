"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/authClients";
import { useGetUserByIdBetterAuthProfile } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Building2,
  Award,
  CheckCircle,
  Key,
  Users,
  BookOpen,
  School,
  AlertCircle,
  UserPlus,
  GoalIcon,
  Landmark,
  Globe,
  GraduationCapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetBetterAuthById } from "@/app/(hooks)/hooks/Users/useBetterAuth";

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

// Foundation fields we render explicitly, in order. Anything else on the
// foundation object still shows up via the generic DataTable fallback below.
const FOUNDATION_FIELD_ORDER = [
  "name",
  "address",
  "phone",
  "email",
  "website",
  "description",
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const isEmpty = (value: any): boolean => {
  return (
    value === null ||
    value === undefined ||
    value === "N/A" ||
    (typeof value === "string" && value.trim() === "")
  );
};

const formatDate = (date: string | Date): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleString("id-ID", DATE_FORMAT_OPTIONS);
};

const formatValue = (val: any): React.ReactNode => {
  if (typeof val === "boolean") {
    return (
      <Badge variant={val ? "default" : "secondary"}>
        {val ? "Yes" : "No"}
      </Badge>
    );
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
    return (
      <pre className="bg-muted max-w-md overflow-x-auto rounded p-2 text-xs">
        {JSON.stringify(val, null, 2)}
      </pre>
    );
  }

  return <span className="font-mono text-sm">{String(val)}</span>;
};

// ═══════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const StatCard = ({
  icon: Icon,
  label,
  value,
  variant = "default",
}: StatCardProps) => {
  if (isEmpty(value)) return null;

  return (
    <Card className={VARIANT_STYLES[variant]}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="bg-background rounded-lg p-2">
            <Icon className="text-muted-foreground h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground text-sm font-medium">{label}</p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => {
  if (isEmpty(value)) return null;

  return (
    <div className="bg-card hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
      <Icon className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground mb-1 text-xs font-medium">
          {label}
        </p>
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

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY / LOADING STATES
// ═══════════════════════════════════════════════════════════════════════════

interface EmptyProfileStateProps {
  session: any;
  userBetterAuth?: any;
}

const EmptyProfileState = ({
  session,
  userBetterAuth,
}: EmptyProfileStateProps) => {
  const router = useRouter();
  const hasFoundation = userBetterAuth?.foundation?.name;
  console.log("foundation", hasFoundation);

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
                    variant={hasFoundation ? "default" : "secondary"}
                    className="shadow-md"
                  >
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {hasFoundation ? "Menunggu Aktivasi" : "Belum Terdaftar"}
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
                  {session?.user?.email || "Tidak ada email"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              {hasFoundation ? (
                <>
                  <AlertTitle>Menunggu Aktivasi Akun</AlertTitle>
                  <AlertDescription>
                    Akun Anda sudah terdaftar, mohon menunggu admin
                    menyambungkan akunmu.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertTitle>Akun Belum Terdaftar</AlertTitle>
                  <AlertDescription>
                    Anda sudah login, tetapi belum terdaftar di yayasan manapun.
                    Silakan hubungi administrator atau daftar ke yayasan untuk
                    melengkapi profil Anda.
                  </AlertDescription>
                </>
              )}
            </Alert>

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
                  <GraduationCapIcon className="text-muted-foreground h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Yayasan</p>
                    <p className="text-sm font-medium">
                      {hasFoundation || "Tidak tersedia"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Nama</p>
                    <p className="text-sm font-medium">
                      {session?.user?.name || "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="text-sm font-medium break-all">
                      {session?.user?.email || "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Key className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">User ID</p>
                    <p className="bg-background rounded px-2 py-1 font-mono text-sm text-xs">
                      {session?.user?.id || "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                {session?.user?.emailVerified && (
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
              {hasFoundation ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/")}
                >
                  <GoalIcon className="mr-2 h-5 w-5" />
                  Ke Halaman Utama
                </Button>
              ) : (
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
                onClick={() => router.push("/auth/sign-in")}
              >
                <Building2 className="mr-2 h-5 w-5" />
                Login Dengan Akun Lain
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
        {/* <Card className="bg-info-surface border-info-border">
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
                  <li>Daftar ke yayasan dengan kode yayasan yang valid</li>
                  <li>Atau hubungi administrator untuk pendaftaran manual</li>
                  <li>Setelah terdaftar, profil lengkap Anda akan muncul</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

const UserProfileSkeleton = ({ message }: { message?: string }) => (
  <div className="min-h-screen px-4 py-8">
    <div className="mx-auto max-w-7xl space-y-6">
      {message && (
        <div className="text-muted-foreground mb-4 text-center text-sm">
          {message}
        </div>
      )}
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
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

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE SECTIONS
// ═══════════════════════════════════════════════════════════════════════════

const UserHeroSection = ({ user }: { user: any }) => (
  <Card className="border-2 shadow-lg">
    <CardHeader className="pb-4">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        {user?.avatarUrl && (
          <div className="relative">
            <div className="border-background ring-primary/20 h-32 w-32 overflow-hidden rounded-full border-4 shadow-xl ring-4">
              <Image
                src={user.avatarUrl}
                alt={user?.name || "User Avatar"}
                width={128}
                height={128}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            {user?.isActive && (
              <div className="bg-success-solid border-background absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-4">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        )}
        <div className="flex-1 text-center md:text-left">
          <CardTitle className="mb-2 text-3xl md:text-4xl">
            {user?.name || "User"}
          </CardTitle>
          <CardDescription className="mb-4 text-lg">
            {user?.email}
          </CardDescription>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            {user?.role?.name && (
              <Badge variant="default" className="px-3 py-1 text-sm">
                <Shield className="mr-1 h-3 w-3" />
                {user.role.name}
              </Badge>
            )}
            {user?.isActive !== undefined && (
              <Badge
                variant={user.isActive ? "default" : "destructive"}
                className="px-3 py-1 text-sm"
              >
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
      <CardDescription>
        Basic personal details and contact information
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <InfoItem icon={Mail} label="Email" value={data.email} />
        <InfoItem icon={Phone} label="Parent Phone" value={data.parentPhone} />
        <InfoItem icon={MapPin} label="Address" value={data.address} />
        <InfoItem
          icon={Calendar}
          label="Birth Date"
          value={data.birthDate ? formatDate(data.birthDate) : null}
        />
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
      <CardDescription>
        Academic details and enrollment information
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <InfoItem icon={Key} label="NIK" value={data.nik} />
        <InfoItem icon={Key} label="NISN" value={data.nisn} />
        <InfoItem
          icon={Calendar}
          label="Enrollment Date"
          value={data.enrollmentDate ? formatDate(data.enrollmentDate) : null}
        />
        <InfoItem
          icon={Calendar}
          label="Start Date"
          value={data.startDate ? formatDate(data.startDate) : null}
        />
        <InfoItem
          icon={Calendar}
          label="End Date"
          value={data.endDate ? formatDate(data.endDate) : null}
        />
        <InfoItem
          icon={Calendar}
          label="Graduation Date"
          value={data.graduationDate ? formatDate(data.graduationDate) : null}
        />
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <InfoItem icon={Key} label="Employee ID" value={data.employeeId} />
          <InfoItem icon={Award} label="Position" value={data.position} />
          <InfoItem icon={Users} label="Relation" value={data.relation} />
        </div>
      </CardContent>
    </Card>
  );
};

// New: Foundation Information Card — shown whenever `foundation` is present
// on the user record. Known fields render as friendly InfoItems; anything
// extra on the foundation object still shows up via the DataTable fallback.
const FoundationInformationCard = ({ foundation }: { foundation: any }) => {
  if (!foundation) return null;

  const { name, address, phone, email, website, description, ...rest } =
    foundation;

  const knownEntries = {
    name,
    address,
    phone,
    email,
    website,
    description,
  };
  const hasKnownData = Object.values(knownEntries).some(
    (value) => !isEmpty(value),
  );

  // Drop id-like / internal keys from the leftover fallback table
  const extraData = Object.fromEntries(
    Object.entries(rest).filter(
      ([key]) => !/id$/i.test(key) && !key.startsWith("_"),
    ),
  );

  if (!hasKnownData && Object.keys(extraData).length === 0) return null;

  return (
    <>
      {hasKnownData && (
        <Card className="border-primary/10 bg-primary/5 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Foundation
            </CardTitle>
            <CardDescription>
              The yayasan (foundation) this account belongs to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoItem icon={School} label="Name" value={name} />
              <InfoItem icon={MapPin} label="Address" value={address} />
              <InfoItem icon={Phone} label="Phone" value={phone} />
              <InfoItem icon={Mail} label="Email" value={email} />
              <InfoItem icon={Globe} label="Website" value={website} />
              <InfoItem
                icon={AlertCircle}
                label="Description"
                value={description}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Any other foundation fields not covered above */}
      <DataTable
        data={extraData}
        title="Additional Foundation Details"
        Icon={<Landmark className="h-5 w-5" />}
      />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function Home() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const {
    data: user,
    isPending: userLoading,
    isError: userError,
  } = useGetUserByIdBetterAuthProfile(userId ?? "");

  const { data: userBetterAuth, isPending: userBetterAuthLoading } =
    useGetBetterAuthById(userId);

  const [isMounted, setIsMounted] = React.useState(false);

  console.log("userid", userId);
  console.log("userData", user);
  console.log("user betterauth", userBetterAuth);

  // Only track if component is mounted on client
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by showing skeleton until mounted
  if (!isMounted) {
    return <UserProfileSkeleton message="Loading..." />;
  }

  // Show loading if no session
  if (!session?.user?.id) {
    return <UserProfileSkeleton message="Authentication required..." />;
  }

  // After mounted, handle loading states (wait for both queries to complete)
  if (userLoading || userBetterAuthLoading) {
    return <UserProfileSkeleton message="Loading profile data..." />;
  }

  // Show loading if user data failed to load
  if (userError) {
    return <UserProfileSkeleton message="Setting up your account..." />;
  }

  // CASE 1: User NOT have foundation id AND NOT have userData
  // Tampilkan button untuk mendaftar di /landing/register/foundation
  if (!userBetterAuth?.foundationId && !userBetterAuth?.userData) {
    return (
      <EmptyProfileState session={session} userBetterAuth={userBetterAuth} />
    );
  }

  // CASE 2: User HAVE foundation id BUT NOT have userData
  // Tampilkan untuk menunggu di-assign oleh admin
  if (userBetterAuth?.foundationId && !userBetterAuth?.userData) {
    return (
      <EmptyProfileState session={session} userBetterAuth={userBetterAuth} />
    );
  }

  // If user data is still loading/null after all foundation checks
  if (!user) {
    return <UserProfileSkeleton message="Loading user data..." />;
  }

  // CASE 3: User HAVE foundation id AND HAVE userData
  // Tampilkan semua data profil lengkap (continue rendering below)

  // Extract nested objects
  const {
    class: classData,
    major,
    foundation,
    academicYear,
    role,
    ...mainData
  } = user;

  return (
    <div className="from-background to-muted/20 min-h-screen bg-linear-to-br px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero Section */}
        <UserHeroSection user={user} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={School} label="Yayasan" value={foundation?.name} />
          <StatCard icon={School} label="Class" value={classData?.name} />
          <StatCard icon={BookOpen} label="Major" value={major?.name} />
          <StatCard
            icon={Calendar}
            label="Academic Year"
            value={academicYear?.year}
          />
          <StatCard icon={Users} label="Role" value={role?.name} />
        </div>

        {/* Foundation Information (shown if the user has a foundation) */}
        <FoundationInformationCard foundation={foundation} />

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
