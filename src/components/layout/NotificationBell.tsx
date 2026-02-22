'use client';

import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/store/notificationStore';

const TYPE_COLORS = {
  success: 'bg-green-500',
  error: 'bg-destructive',
  warning: 'bg-yellow-500',
  info: 'bg-primary',
} as const;

export function NotificationBell() {
  const router = useRouter();
  const { notifications, markAllRead, markRead } = useNotificationStore();

  const unreadCount = notifications.filter(n => !n.read).length;
  const recent = notifications.slice(0, 5);

  function handleClick(id: string, href: string) {
    markRead(id);
    router.push(href);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          title="Notifications"
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-muted-foreground hover:text-foreground cursor-pointer text-xs transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        <DropdownMenuSeparator />

        {recent.length === 0 ? (
          <div className="text-muted-foreground px-2 py-6 text-center text-sm">
            No notifications yet
          </div>
        ) : (
          recent.map(n => (
            <DropdownMenuItem
              key={n.id}
              className="flex cursor-pointer items-start gap-3 px-3 py-3"
              onClick={() => handleClick(n.id, n.href)}
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_COLORS[n.type]} ${n.read ? 'opacity-30' : ''}`}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm leading-snug ${n.read ? 'text-muted-foreground' : 'font-medium'}`}
                >
                  {n.message}
                </p>
                <p
                  className="text-muted-foreground mt-0.5 text-xs"
                  suppressHydrationWarning
                >
                  {formatDistanceToNowStrict(new Date(n.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
