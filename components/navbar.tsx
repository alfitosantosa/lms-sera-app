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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const permissionLabels: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard ",
  "/dashboard/betterauth": "BetterAuth Management",
  "/dashboard/roles": "Roles Management",
  "/dashboard/users": "Users Management",
  "/dashboard/academicyear": "Tahun Ajaran Management",
  "/dashboard/majors": "Branch Management",
  "/dashboard/classes": "Kelas Management",
  "/dashboard/subjects": "Mata Pelajaran Management",
  "/dashboard/schedules": "Jadwal Management",
  "/dashboard/attendance": "Absensi Management",
  "/dashboard/typeviolations": "Jenis Pelanggaran Management",
  "/dashboard/violations": "Pelanggaran Management",
  "/dashboard/paymenttypes": "Jenis Tagihan Management",
  "/dashboard/payments": "Transaksi Management",
  "/dashboard/specialschedule": "Jadwal Khusus",
  "/dashboard/calender": "Kalender",
  "/dashboard/calender/teacher": "Kalender untuk Guru",
  "/dashboard/calender/student": "Kalender untuk Siswa",
  "/dashboard/violations/student": "Pelanggaran untuk Siswa",
  "/dashboard/violations/teacher": "Pelanggaran untuk Guru",
  "/dashboard/teacher/schedule": "Jadwal untuk Guru",
  "/dashboard/student/attendance": "Absensi untuk Siswa",
  "/dashboard/student/schedule": "Jadwal untuk Siswa",
  "/dashboard/parent": "Orang Tua Page",
  "/dashboard/upload/users": "Upload Users",
  "/dashboard/botwa": "Botwa Management",
  "/dashboard/attendance/teacher": "Absensi Kepala Sekolah",
  "/dashboard/admin/attendance": "Absensi Admin Backup",
  "/dashboard/recapattendance": "Rekap Absensi",
  "/dashboard/calender/list/teacher": "Kalender List untuk Guru",
  "/dashboard/calender/list/student": "Kalender List untuk Siswa",
  "/dashboard/upload/schedules": "Upload Jadwal",
  "/dashboard/recapattendance/class": "Rekap Absensi Kelas",
  "/dashboard/classes/tahfidz": "Tahfidz Group Management",
  "/dashboard/student/payment": "Pembayaran untuk Siswa",
  "/dashboard/tahfidzrecord": "Setoran Tahfidz Management",
  "/dashboard/student/tahfidzrecord": "Setoran Tahfidz untuk Siswa",
  "/dashboard/profile": "Profile",
  "/dashboard/accountbank": "Account Bank Management",
  //for admin
  "/dashboard/billing": " Tagihan Management",
  "/dashboard/studentinformation": "Informasi Siswa",
  //for bendahara
  "/dashboard/bendahara/payment": "Data Transaksi",
  "/dashboard/bendahara/users": "Data Siswa",
  "/dashboard/bendahara/class": "Data Kelas",
  "/dashboard/bendahara/paymenttype": "Jenis Tagihan",
  "/dashboard/bendahara/billing": "Data Tagihan",
  "/dashboard/bendahara/billing/upload": "Upload Tagihan",
  "/dashboard/bendahara/users/upload": "Upload Data Siswa",
  "/dashboard/bendahara/studentinformation": "Informasi Siswa",
  "/dashboard/payments/chart": "Dashboard Transaksi",
  "/dashboard/billing/chart": "Dashboard Tagihan",
  "/dashboard/accountbank/chart": "Dashboard Saldo",
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

  const navigationItems = (userData?.role?.permissions || []).map((permission: string) => ({
    href: permission,
    label: permissionLabels[permission] || permission,
  }));

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
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Memuat data anda...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in - show navbar with login button
  if (!userData) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Image src={Logo} alt={`Logo ${process.env.NEXT_PUBLIC_CLIENT_NAME}`} className="h-10 w-10" />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">{process.env.NEXT_PUBLIC_CLIENT_NAME}</h1>
                <p className="text-sm text-gray-500">Sistem Informasi Sekolah</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push("/auth/sign-in")}>
              Login
            </Button>
          </div>
        </div>
      </header>
    );
  }

  // Logged in - show full navbar with avatar and menu
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Image src={Logo} alt={`Logo ${process.env.NEXT_PUBLIC_CLIENT_NAME}`} className="h-10 w-10" />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">{process.env.NEXT_PUBLIC_CLIENT_NAME}</h1>
                <p className="text-sm text-gray-500">Sistem Informasi Sekolah</p>
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
                  {navigationItems.map((item: { href: string; label: string }) => (
                    <SelectItem key={item.href} value={item.href}>
                      {item.label}
                    </SelectItem>
                  ))}
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
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <Image width={40} height={40} src={userData.avatarUrl || "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png"} alt={userData.name || "User"} />
                    <AvatarFallback>{getUserInitials(userData.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userData.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
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
