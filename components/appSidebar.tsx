"use client";

import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
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
import { AlertTriangle, BarChart3, Building2, Calendar, ChevronRight, ClipboardCheck, CreditCard, FileText, GraduationCap, Home, LayoutDashboard, LogOut, MessageSquare, Settings, Upload, User as UserIcon, Users } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { Avatar, AvatarFallback } from "./ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { menuGroups } from "@/app/repository/menuGroupsSidebar";

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

// Menu structure with grouping
type MenuItem = {
  title: string;
  url: string;
  icon?: keyof typeof iconMap;
  items?: MenuItem[];
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

// Define menu groups

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  const userRole = userData?.role?.name?.toLowerCase() || "student";
  const permissions = userData?.role?.permissions || [];

  // Map role names to menu groups
  // Super Admin, Admin → admin menu
  // Bendahara → bendahara menu
  // Teacher, Guru → teacher menu
  // Student, Siswa → student menu
  // Parent, Orang Tua → parent menu
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
        // If item has sub-items, check if parent has permission OR any sub-item has permission
        if (item.items) {
          const filteredSub = filterMenuByPermissions(item.items);
          // Show parent if it has permission OR if any sub-items passed the filter
          return permissions.includes(item.url) || filteredSub.length > 0;
        }
        // For items without sub-items, check if user has permission
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

  const LogoUrl = process.env.NEXT_PUBLIC_CLIENT_IMAGE_URL;
  const DefaultLogo = "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png";

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Image src={LogoUrl || DefaultLogo} alt="Logo" width={120} height={120} className="h-10 w-10" loading="eager" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{process.env.NEXT_PUBLIC_CLIENT_NAME}</span>
            <span className="text-xs text-muted-foreground">Sistem Informasi</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-3 py-4 overflow-auto">
        {currentMenuGroups.map((group, groupIndex) => {
          const filteredItems = filterMenuByPermissions(group.items);
          if (filteredItems.length === 0) return null;

          return (
            <SidebarGroup key={groupIndex} className="mb-4">
              <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null;
                    const isActive = pathname === item.url;
                    const hasSubItems = item.items && item.items.length > 0;

                    if (hasSubItems) {
                      return (
                        <Collapsible key={item.url} defaultOpen={item.items?.some((sub) => pathname === sub.url)}>
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton className="w-full">
                                {Icon && <Icon className="h-4 w-4" />}
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub className="ml-4 mt-1">
                                {item.items?.map((subItem) => {
                                  const isSubActive = pathname === subItem.url;
                                  return (
                                    <SidebarMenuSubItem key={subItem.url}>
                                      <SidebarMenuSubButton asChild isActive={isSubActive} onClick={() => router.push(subItem.url)}>
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
                        <SidebarMenuButton asChild isActive={isActive} onClick={() => router.push(item.url)}>
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
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

      {/* Footer */}
      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors">
              <Avatar className="h-9 w-9">
                {userData?.avatarUrl && <Image width={36} height={36} src={userData.avatarUrl} alt={userData.name || "User"} className="rounded-full" />}
                <AvatarFallback className="text-xs">{getUserInitials(userData?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-medium truncate w-full">{userData?.name || "User"}</span>
                <span className="text-xs text-muted-foreground truncate w-full">{userData?.role?.name || "Role"}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
