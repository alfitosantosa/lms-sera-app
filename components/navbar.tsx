"use client";

import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { signOut, useSession } from "@/lib/authClients";
import Logo from "@/public/Logo.svg";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const permissionLabels: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard ",
  "/dashboard/admin/master/betterauth": "BetterAuth Management",
  "/dashboard/admin/master/roles": "Roles Management",
  "/dashboard/admin/master/users": "Users Management",
  "/dashboard/admin/master/academicyear": "Tahun Ajaran Management",
  "/dashboard/admin/master/majors": "Branch Management",
  "/dashboard/admin/master/classes": "Kelas Management",
  "/dashboard/admin/master/subjects": "Mata Pelajaran Management",
  "/dashboard/admin/academic/schedules": "Jadwal Management",
  "/dashboard/attendance": "Absensi Management",
  "/dashboard/admin/discipline/typeviolations": "Jenis Pelanggaran Management",
  "/dashboard/violations": "Pelanggaran Management",
  "/dashboard/admin/finance/paymenttypes": "Jenis Tagihan Management",
  "/dashboard/admin/finance/payments": "Transaksi Management",
  "/dashboard/admin/academic/specialschedule": "Jadwal Khusus",
  "/dashboard/calender": "Kalender",
  "/dashboard/calender/teacher": "Kalender untuk Guru",
  "/dashboard/calender/student": "Kalender untuk Siswa",
  "/dashboard/violations/student": "Pelanggaran untuk Siswa",
  "/dashboard/violations/teacher": "Pelanggaran untuk Guru",
  "/dashboard/teacher/schedule": "Jadwal untuk Guru",
  "/dashboard/student/attendance": "Absensi untuk Siswa",
  "/dashboard/student/schedule": "Jadwal untuk Siswa",
  "/dashboard/parent": "Orang Tua Page",
  "/dashboard/admin/utility/upload/users": "Upload Users",
  "/dashboard/admin/utility/botwa": "Botwa Management",
  "/dashboard/attendance/teacher": "Absensi Kepala Sekolah",
  "/dashboard/admin/attendance": "Absensi Admin Backup",
  "/dashboard/recapattendance": "Rekap Absensi",
  "/dashboard/calender/list/teacher": "Kalender List untuk Guru",
  "/dashboard/calender/list/student": "Kalender List untuk Siswa",
  "/dashboard/admin/utility/upload/schedules": "Upload Jadwal",
  "/dashboard/recapattendance/class": "Rekap Absensi Kelas",
  "/dashboard/admin/master/classes/tahfidz": "Tahfidz Group Management",
  "/dashboard/student/payment": "Pembayaran untuk Siswa",
  "/dashboard/admin/academic/tahfidzrecord": "Setoran Tahfidz Management",
  "/dashboard/student/tahfidzrecord": "Setoran Tahfidz untuk Siswa",
  "/dashboard/profile": "Profile",
  "/dashboard/admin/finance/accountbank": "Account Bank Management",
  //for admin
  "/dashboard/admin/finance/billing": " Tagihan Management",
  "/dashboard/admin/finance/studentinformation": "Informasi Siswa",
  //for bendahara
  "/dashboard/treasurer/payment": "Data Transaksi",
  "/dashboard/treasurer/users": "Data Siswa",
  "/dashboard/treasurer/class": "Data Kelas",
  "/dashboard/treasurer/paymenttype": "Jenis Tagihan",
  "/dashboard/treasurer/billing": "Data Tagihan",
  "/dashboard/treasurer/billing/upload": "Upload Tagihan",
  "/dashboard/treasurer/users/upload": "Upload Data Siswa",
  "/dashboard/treasurer/studentinformation": "Informasi Siswa",
  "/dashboard/admin/finance/payments/chart": "Dashboard Transaksi",
  "/dashboard/admin/finance/billing/chart": "Dashboard Tagihan",
  "/dashboard/admin/finance/accountbank/chart": "Dashboard Saldo",
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Get session from Better Auth
  const { data: session, isPending } = useSession();
  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  const userRoles = userData?.role?.name;

  const handleNavigate = (value: string) => {
    router.push(value);
  };

  const handleSignOut = async () => {
    signOut();
    router.push("/auth/sign-in");
  };

  const navigationItems = (userData?.role?.permissions || []).map(
    (permission: string) => ({
      href: permission,
      label: permissionLabels[permission] || permission,
    }),
  );

  // Get user initials for avatar
  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (isPending) {
    return (
      <div className="w-full">
        <div className="flex h-32 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground mt-2 text-sm">
              Memuat data anda...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in - show navbar with login button
  if (!userData) {
    return (
      <header className="bg-background border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <Image
                src={Logo}
                alt={`Logo ${process.env.NEXT_PUBLIC_CLIENT_NAME}`}
                className="h-10 w-10"
              />
              <div className="hidden md:block">
                <h1 className="text-foreground text-xl font-bold">
                  {process.env.NEXT_PUBLIC_CLIENT_NAME}
                </h1>
                <p className="text-muted-foreground text-sm">
                  Sistem Informasi Sekolah
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/auth/sign-in")}
            >
              Login
            </Button>
          </div>
        </div>
      </header>
    );
  }

  // Logged in - show full navbar with avatar and menu
  return (
    <header className="bg-background border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Image
                src={Logo}
                alt={`Logo ${process.env.NEXT_PUBLIC_CLIENT_NAME}`}
                className="h-10 w-10"
              />
              <div className="hidden md:block">
                <h1 className="text-foreground text-xl font-bold">
                  {process.env.NEXT_PUBLIC_CLIENT_NAME}
                </h1>
                <p className="text-muted-foreground text-sm">
                  Sistem Informasi Sekolah
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation Select */}
            {navigationItems.length > 0 && (
              <Select onValueChange={handleNavigate} value={pathname}>
                <SelectTrigger className="w-50">
                  <SelectValue placeholder="Pilih Menu" />
                </SelectTrigger>
                <SelectContent>
                  {navigationItems.map(
                    (item: { href: string; label: string }) => (
                      <SelectItem key={item.href} value={item.href}>
                        {item.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            )}

            {/* Role Badge */}
            <div className="hidden md:block">
              <Badge variant="default" className="px-3 py-1">
                {userRoles || "User"}
              </Badge>
            </div>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <Image
                      width={40}
                      height={40}
                      src={
                        userData.avatarUrl ||
                        "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png"
                      }
                      alt={userData.name || "User"}
                    />
                    <AvatarFallback>
                      {getUserInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {userData.name || "User"}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {userData.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
