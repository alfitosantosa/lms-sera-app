"use client";


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
  Upload,
  User as UserIcon,
  Users,
} from "lucide-react";

import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { menuGroups } from "@/app/repository/menuGroupsSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { type ElementType } from "react";

// Icon mapping
const iconMap: Record<string, ElementType> = {
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
  const { data: session, isPending: isSessionPending } = useSession();
  const { data: userData, isLoading: isUserDataLoading } =
    useGetUserByIdBetterAuth(session?.user?.id ?? "");

  // Show loading state while data is being fetched
  if (isSessionPending || isUserDataLoading) {
    return (
      <Sidebar className="border-border bg-sidebar text-foreground border-r">
        <SidebarHeader className="border-border bg-sidebar border-b px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-foreground text-[17px] font-extrabold">
              Sera
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Memuat menu...</p>
        </SidebarContent>
      </Sidebar>
    );
  }

  const userRole = userData?.role?.name || "Student";
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
    if (r.includes("student") || r.includes("siswa")) return "student";
    if (r.includes("parent") || r.includes("orang tua")) return "parent";

    // Default fallback to student
    return "student";
  };

  const roleMenuKey = getRoleMenuKey(userRole);
  const currentMenuGroups = menuGroups[roleMenuKey] || menuGroups.student;

  // console.log("🔑 Role Debug:", {
  //   userRole,
  //   roleMenuKey,
  //   hasMenuGroups: !!menuGroups[roleMenuKey],
  //   menuGroupKeys: Object.keys(menuGroups),
  //   currentMenuGroupsLength: currentMenuGroups?.length,
  //   firstGroup: currentMenuGroups?.[0]?.title,
  // });

  // Filter menu items based on permissions
  const filterMenuByPermissions = (items: MenuItem[]): MenuItem[] => {
    // Admin, Yayasan, Treasurer, Teacher, Student, and Parent roles see ALL menus (bypass permission filtering)
    if (
      userRoleLower.includes("admin") ||
      userRoleLower.includes("yayasan") ||
      userRoleLower.includes("treasurer") ||
      userRoleLower.includes("bendahara") ||
      userRoleLower.includes("teacher") ||
      userRoleLower.includes("guru") ||
      userRoleLower.includes("student") ||
      userRoleLower.includes("siswa") ||
      userRoleLower.includes("parent") ||
      userRoleLower.includes("orang tua")
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
    <Sidebar className="border-border bg-sidebar text-foreground border-r">
      {/* ── Brand & Institution Header ── */}
      <SidebarHeader className="border-border bg-sidebar border-b px-5 py-4">
        <Link href="/" className="group flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
              <span className="bg-primary relative inline-flex h-2.5 w-2.5 rounded-full" />
            </span>
            <span className="text-foreground group-hover:text-primary text-[17px] font-extrabold tracking-tight transition-colors">
              Sera
            </span>
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
              LMS
            </span>
          </div>
        </Link>
        <div className="text-muted-foreground mt-1 flex items-center gap-1.5 truncate text-[11px] font-medium">
          <Building2 className="text-primary h-3 w-3 shrink-0" />
          <span className="truncate">{clientName}</span>
        </div>
      </SidebarHeader>

      {/* ── Menu Navigation Content ── */}
      <SidebarContent className="scrollbar-thin overflow-y-auto px-3 py-3">
        {currentMenuGroups.map((group, groupIndex) => {
          const filteredItems = filterMenuByPermissions(group.items);
          if (filteredItems.length === 0) return null;

          return (
            <SidebarGroup key={groupIndex} className="mb-2">
              <SidebarGroupLabel className="text-muted-foreground mb-1 px-3 text-[10px] font-bold tracking-wider uppercase">
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
                                <ChevronRight className="text-muted-foreground h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <SidebarMenuSub className="border-border mt-0.5 ml-4 space-y-0.5 border-l pl-2">
                                {item.items?.map((subItem) => {
                                  const isSubActive = pathname === subItem.url;
                                  return (
                                    <SidebarMenuSubItem key={subItem.url}>
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={isSubActive}
                                        onClick={() => router.push(subItem.url)}
                                        className={`rounded-lg px-2.5 py-1.5 text-xs transition-all ${isSubActive ? "bg-primary font-semibold text-white shadow-xs" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
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
                              ? "bg-primary/8 text-primary shadow-primary/10 font-bold shadow-sm"
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
      <SidebarFooter className="border-border bg-sidebar border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group hover:border-border hover:bg-secondary flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2 text-left transition-all">
              <Avatar className="border-border bg-brand-tint text-primary h-8 w-8 rounded-full border">
                {userData?.avatarUrl && (
                  <Image
                    width={32}
                    height={32}
                    src={userData.avatarUrl}
                    alt={userData.name || "User"}
                    className="rounded-full object-cover"
                  />
                )}
                <AvatarFallback className="bg-brand-tint text-primary text-[11px] font-bold">
                  {getUserInitials(userData?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-foreground truncate text-xs font-bold">
                  {userData?.name || "Pengguna"}
                </span>
                <span className="text-muted-foreground truncate text-[10px] capitalize">
                  {userData?.role?.name || "Siswa"}
                </span>
              </div>

              <ChevronRight className="text-muted-foreground h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="right"
            className="border-border w-56 rounded-xl p-1.5 shadow-lg"
          >
            <DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs">
              <div>Akun Terhubung</div>
              <div className="text-foreground truncate font-bold">
                {session?.user?.email || "user@sekolah.com"}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              className="text-secondary-foreground hover:bg-secondary hover:text-primary cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium"
            >
              <UserIcon className="text-primary mr-2 h-4 w-4" />
              <span>Profil Pengguna</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive hover:bg-destructive-chip cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium"
            >
              <LogOut className="text-destructive mr-2 h-4 w-4" />
              <span>Keluar dari Akun</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
