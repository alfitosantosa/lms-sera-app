"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  Upload,
  User as UserIcon,
  Users,
} from "lucide-react";

import { useGetUserByIdBetterAuth } from "@/app/(frontend)/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { menuGroups } from "@/app/repository/menuGroupsSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/authClients";

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  home: Home,
  dashboard: LayoutDashboard,
  users: Users,
  academic: GraduationCap,
  calendar: Calendar,
  attendance: ClipboardCheck,
  violation: AlertTriangle,
  payment: CreditCard,
  upload: Upload,
  bot: MessageSquare,
  chart: BarChart3,
  bank: Building2,
  file: FileText,
  settings: Settings,
};

type MenuItem = {
  title: string;
  url: string;
  icon?: keyof typeof iconMap;
  items?: MenuItem[];
};

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  const userRole = userData?.role?.name?.toLowerCase() || "student";
  const permissions = userData?.role?.permissions || [];

  // Map role names to menu groups
  const getRoleMenuKey = (role: string): string => {
    if (role.includes("admin")) return "admin";
    if (role.includes("bendahara")) return "bendahara";
    if (role.includes("teacher") || role.includes("guru")) return "teacher";
    if (role.includes("parent") || role.includes("orang tua")) return "parent";
    return "student";
  };

  const roleMenuKey = getRoleMenuKey(userRole);
  const currentMenuGroups = menuGroups[roleMenuKey] || menuGroups.student;

  // Filter menu items based on permissions
  const filterMenuByPermissions = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        if (item.items) {
          const filteredSub = filterMenuByPermissions(item.items);
          return permissions.includes(item.url) || filteredSub.length > 0;
        }
        return permissions.includes(item.url);
      })
      .map((item) => {
        if (item.items) {
          return {
            ...item,
            items: filterMenuByPermissions(item.items),
          };
        }
        return item;
      });
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/sign-in");
  };

  const clientName = process.env.NEXT_PUBLIC_CLIENT_NAME || "Yayasan Rahmaniyah";

  return (
    <Sidebar className="border-r border-[#e3e8ee] bg-white text-[#0d253d]">
      {/* ── Brand & Institution Header ── */}
      <SidebarHeader className="border-b border-[#e3e8ee] px-5 py-4 bg-white">
        <Link href="/" className="group flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#533afd] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#533afd]" />
            </span>
            <span className="text-[17px] font-extrabold tracking-tight text-[#0d253d] transition-colors group-hover:text-[#533afd]">
              Sera
            </span>
            <span className="rounded-full bg-[#533afd]/10 px-2 py-0.5 text-[10px] font-bold text-[#533afd]">
              LMS
            </span>
          </div>
        </Link>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#64748d] truncate">
          <Building2 className="h-3 w-3 shrink-0 text-[#533afd]" />
          <span className="truncate">{clientName}</span>
        </div>
      </SidebarHeader>

      {/* ── Menu Navigation Content ── */}
      <SidebarContent className="px-3 py-3 overflow-y-auto scrollbar-thin">
        {currentMenuGroups.map((group, groupIndex) => {
          const filteredItems = filterMenuByPermissions(group.items);
          if (filteredItems.length === 0) return null;

          return (
            <SidebarGroup key={groupIndex} className="mb-2">
              <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#64748d] mb-1">
                {group.title}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null;
                    const isActive = pathname === item.url;
                    const hasSubItems = item.items && item.items.length > 0;

                    if (hasSubItems) {
                      const isAnySubActive = item.items?.some((sub) => pathname === sub.url);

                      return (
                        <Collapsible key={item.url} defaultOpen={isAnySubActive}>
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                className={`group/btn w-full justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                                  isAnySubActive
                                    ? "bg-[#533afd]/8 text-[#533afd] font-semibold"
                                    : "text-[#273951] hover:bg-[#f6f9fc] hover:text-[#0d253d]"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  {Icon && (
                                    <Icon
                                      className={`h-4 w-4 transition-colors ${
                                        isAnySubActive
                                          ? "text-[#533afd]"
                                          : "text-[#64748d] group-hover/btn:text-[#0d253d]"
                                      }`}
                                    />
                                  )}
                                  <span>{item.title}</span>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 text-[#64748d] transition-transform duration-200 group-data-[state=open]:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <SidebarMenuSub className="ml-4 mt-0.5 space-y-0.5 border-l border-[#e3e8ee] pl-2">
                                {item.items?.map((subItem) => {
                                  const isSubActive = pathname === subItem.url;
                                  return (
                                    <SidebarMenuSubItem key={subItem.url}>
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={isSubActive}
                                        onClick={() => router.push(subItem.url)}
                                        className={`rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                                          isSubActive
                                            ? "bg-[#533afd] text-white font-semibold shadow-xs"
                                            : "text-[#64748d] hover:bg-[#f6f9fc] hover:text-[#0d253d]"
                                        }`}
                                      >
                                        <span>{subItem.title}</span>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  );
                                })}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      );
                    }

                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          onClick={() => router.push(item.url)}
                          className={`group/item w-full rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                            isActive
                              ? "bg-[#533afd] text-white font-semibold shadow-sm shadow-[#533afd]/25"
                              : "text-[#273951] hover:bg-[#f6f9fc] hover:text-[#0d253d]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {Icon && (
                              <Icon
                                className={`h-4 w-4 transition-colors ${
                                  isActive
                                    ? "text-white"
                                    : "text-[#64748d] group-hover/item:text-[#0d253d]"
                                }`}
                              />
                            )}
                            <span>{item.title}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* ── User Profile Footer ── */}
      <SidebarFooter className="border-t border-[#e3e8ee] p-3 bg-white">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2 text-left transition-all hover:border-[#e3e8ee] hover:bg-[#f6f9fc]">
              <Avatar className="h-8 w-8 rounded-full border border-[#e3e8ee] bg-[#ebe8ff] text-[#533afd]">
                {userData?.avatarUrl && (
                  <Image
                    width={32}
                    height={32}
                    src={userData.avatarUrl}
                    alt={userData.name || "User"}
                    className="rounded-full object-cover"
                  />
                )}
                <AvatarFallback className="bg-[#ebe8ff] text-[11px] font-bold text-[#533afd]">
                  {getUserInitials(userData?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-1 flex-col min-w-0">
                <span className="truncate text-xs font-bold text-[#0d253d]">
                  {userData?.name || "Pengguna"}
                </span>
                <span className="truncate text-[10px] text-[#64748d] capitalize">
                  {userData?.role?.name || "Siswa"}
                </span>
              </div>

              <ChevronRight className="h-3.5 w-3.5 text-[#64748d] opacity-60 transition-transform group-hover:translate-x-0.5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="right" className="w-56 rounded-xl border-[#e3e8ee] p-1.5 shadow-lg">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs text-[#64748d]">
              <div>Akun Terhubung</div>
              <div className="font-bold text-[#0d253d] truncate">{session?.user?.email || "user@sekolah.com"}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#e3e8ee]" />

            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium text-[#273951] hover:bg-[#f6f9fc] hover:text-[#533afd]"
            >
              <UserIcon className="mr-2 h-4 w-4 text-[#533afd]" />
              <span>Profil Pengguna</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-[#e3e8ee]" />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium text-[#ea2261] hover:bg-[#fde2e9]"
            >
              <LogOut className="mr-2 h-4 w-4 text-[#ea2261]" />
              <span>Keluar dari Akun</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
