"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type AppNotification = components["schemas"]["NotificationOut"];

export const NOTIFICATIONS_KEY = ["notifications"] as const;

// Polling is enough for the POC: requests and decisions aren't time-critical.
const POLL_MS = 60_000;

export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => unwrap(api.GET("/api/v1/notifications")),
    refetchInterval: POLL_MS,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | "all") =>
      id === "all"
        ? unwrap(api.POST("/api/v1/notifications/read-all"))
        : unwrap(
            api.POST("/api/v1/notifications/{notification_id}/read", {
              params: { path: { notification_id: id } },
            }),
          ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });
}
