import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@shram-sewa/shared";
import { getSupabaseClient, isSupabaseConfigured } from "../lib";
import { useAuthSession } from "./use-auth-session";

function canUseBackend() {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    getSupabaseClient();
    return true;
  } catch {
    return false;
  }
}

export function getNotificationDisplayMessage(
  notification: Notification,
  locale: "en" | "ne" = "en",
): string {
  if (locale === "ne" && notification.bodyNp) {
    return notification.bodyNp;
  }

  return notification.body;
}

export function getRelativeTimeLabel(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function useNotifications(enabled = true) {
  const backendReady = enabled && canUseBackend();
  const sessionQuery = useAuthSession(backendReady);
  const userId = sessionQuery.data?.user?.id;

  return useQuery({
    queryKey: ["notifications", userId ?? ""],
    enabled: backendReady && !!userId,
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("notifications")
        .select(
          "id, user_id, hire_id, type, title, title_np, body, body_np, is_read, push_sent, created_at",
        )
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return (
        (data ?? []) as Array<{
          id: string;
          user_id: string;
          hire_id: string | null;
          type:
            | "hire_request"
            | "hire_accepted"
            | "hire_rejected"
            | "hire_completed"
            | "new_review"
            | "system";
          title: string;
          title_np: string | null;
          body: string;
          body_np: string | null;
          is_read: boolean;
          push_sent: boolean;
          created_at: string;
        }>
      ).map(
        (row): Notification => ({
          id: row.id,
          userId: row.user_id,
          hireId: row.hire_id ?? undefined,
          type: row.type,
          title: row.title,
          titleNp: row.title_np ?? undefined,
          body: row.body,
          bodyNp: row.body_np ?? undefined,
          isRead: row.is_read,
          pushSent: row.push_sent,
          createdAt: new Date(row.created_at),
        }),
      );
    },
    staleTime: 45 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const supabase = getSupabaseClient();
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
