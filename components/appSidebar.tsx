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

import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { menuGroups } from "@/app/repository/menuGroupsSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

  const userRole = userData?.role?.name || "student";
  const userRoleLower = userRole.toLowerCase();
  const permissions = userData?.role?.permissions || [];

  // Map role names to menu group keys (menuGroups uses lowercase keys)
  const getRoleMenuKey = (role: string): string => {
    const r = role.toLowerCase();
    if (r.includes("admin") || r.includes("yayasan")) return "admin";
    if (r.includes("bendahara") || r.includes("treasurer")) return "treasurer";
    if (
      r.includes("teacher") ||
      r.includes("head of school") ||
      r.includes("guru") ||
      r.includes("kepala sekolah")
    )
      return "teacher";
    if (r.includes("parent") || r.includes("orang tua")) return "parent";
    return "student";
  };

  const roleMenuKey = getRoleMenuKey(userRole);
  const currentMenuGroups = menuGroups[roleMenuKey] || menuGroups.student;

  // Debug logging (remove in production)
  React.useEffect(() => {
    if (userData?.role) {
      console.log("🔍 Sidebar Debug:", {
        originalRole: userData.role.name,
        userRole,
        userRoleLower,
        roleMenuKey,
        hasMenuGroup: !!menuGroups[roleMenuKey],
        menuGroupsAvailable: Object.keys(menuGroups),
        permissionsCount: permissions.length,
      });
    }
  }, [
    userData?.role,
    userRole,
    userRoleLower,
    roleMenuKey,
    permissions.length,
  ]);

  // Filter menu items based on permissions
  const filterMenuByPermissions = (items: MenuItem[]): MenuItem[] => {
    // Admin, Yayasan, and Treasurer roles see ALL menus (bypass permission filtering)
    if (
      userRoleLower.includes("admin") ||
      userRoleLower.includes("yayasan") ||
      userRoleLower.includes("treasurer") ||
      userRoleLower.includes("bendahara")
    ) {
      return items;
    }

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

  const clientName = "Sera App";

  return (
    <Sidebar className="border-r border-border bg-sidebar text-foreground">
      {/* ── Brand & Institution Header ── */}
      <SidebarHeader className="border-b border-border px-5 py-4 bg-sidebar">
        <Link href="/" className="group flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-[17px] font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary">
              Sera
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              LMS
            </span>
          </div>
        </Link>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground truncate">
          <Building2 className="h-3 w-3 shrink-0 text-primary" />
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
              <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {group.title}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null;
                    const isActive = pathname === item.url;
                    const hasSubItems = item.items && item.items.length > 0;

                    if (hasSubItems) {
                      const isAnySubActive = item.items?.some(
                        (sub) => pathname === sub.url,
                      );

                      return (
                        <Collapsible
                          key={item.url}
                          defaultOpen={isAnySubActive}
                        >
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                className={`group/btn w-full justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                                  isAnySubActive
                                    ? "bg-primary/8 text-primary font-semibold"
                                    : "text-secondary-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  {Icon && (
                                    <Icon
                                      className={`h-4 w-4 transition-colors ${isAnySubActive ? "text-primary" : "text-muted-foreground group-hover/btn:text-foreground"}`}
                                    />
                                  )}
                                  <span>{item.title}</span>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <SidebarMenuSub className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                                {item.items?.map((subItem) => {
                                  const isSubActive = pathname === subItem.url;
                                  return (
                                    <SidebarMenuSubItem key={subItem.url}>
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={isSubActive}
                                        onClick={() => router.push(subItem.url)}
                                        className={`rounded-lg px-2.5 py-1.5 text-xs transition-all ${isSubActive ? "bg-primary text-white font-semibold shadow-xs" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
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
                              ? "bg-primary/8 text-primary font-bold shadow-sm shadow-primary/10"
                              : "text-secondary-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {Icon && (
                              <Icon
                                className={`h-4 w-4 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground"}`}
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
      <SidebarFooter className="border-t border-border p-3 bg-sidebar">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2 text-left transition-all hover:border-border hover:bg-secondary">
              <Avatar className="h-8 w-8 rounded-full border border-border bg-brand-tint text-primary">
                {userData?.avatarUrl && (
                  <Image
                    width={32}
                    height={32}
                    src={userData.avatarUrl}
                    alt={userData.name || "User"}
                    className="rounded-full object-cover"
                  />
                )}
                <AvatarFallback className="bg-brand-tint text-[11px] font-bold text-primary">
                  {getUserInitials(userData?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-1 flex-col min-w-0">
                <span className="truncate text-xs font-bold text-foreground">
                  {userData?.name || "Pengguna"}
                </span>
                <span className="truncate text-[10px] text-muted-foreground capitalize">
                  {userData?.role?.name || "Siswa"}
                </span>
              </div>

              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-60 transition-transform group-hover:translate-x-0.5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="right"
            className="w-56 rounded-xl border-border p-1.5 shadow-lg"
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground">
              <div>Akun Terhubung</div>
              <div className="font-bold text-foreground truncate">
                {session?.user?.email || "user@sekolah.com"}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium text-secondary-foreground hover:bg-secondary hover:text-primary"
            >
              <UserIcon className="mr-2 h-4 w-4 text-primary" />
              <span>Profil Pengguna</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive-chip"
            >
              <LogOut className="mr-2 h-4 w-4 text-destructive" />
              <span>Keluar dari Akun</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
