"use client";

import {
  useGetNotifications,
  useMarkNotificationRead,
} from "@/app/(hooks)/hooks/Development/useNotifications";
import { type NotificationDTO } from "@/app/(types)";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

/**
 * Lonceng notifikasi topbar. Daftar selalu notifikasi aktor sendiri
 * (`/api/notifications` menentukan identitas dari sesi); klik = tandai dibaca
 * (backend hanya menyentuh baris milik aktor) lalu pindah ke `link`.
 */
export function NotificationBell() {
  const router = useRouter();
  const { data } = useGetNotifications({ limit: 10 });
  const markRead = useMarkNotificationRead();

  const unreadCount = data?.unreadCount ?? 0;
  const items = data?.data ?? [];

  const handleOpen = (notification: NotificationDTO) => {
    if (!notification.isRead) markRead.mutate(notification.id);
    if (notification.link) router.push(notification.link);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount > 0
              ? `Notifikasi, ${unreadCount} belum dibaca`
              : "Notifikasi"
          }
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] leading-none"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-border border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifikasi</p>
        </div>
        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
              Belum ada notifikasi
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {items.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleOpen(notification)}
                    className="hover:bg-accent w-full px-4 py-3 text-left transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {!notification.isRead && (
                        <span
                          className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          aria-hidden
                        />
                      )}
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>
                        <p className="text-muted-foreground line-clamp-2 text-xs whitespace-pre-line">
                          {notification.message}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true, locale: localeId },
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
