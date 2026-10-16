"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type OutgoingRequest = components["schemas"]["OutgoingAccessRequest"];
export type NewAccessRequest = components["schemas"]["CreateAccessRequest"];

export const MY_REQUESTS_KEY = ["access-requests"] as const;

/** A teacher's or specialist's own requests. Never says whether a code matched a child. */
export function useMyRequests() {
  return useQuery({
    queryKey: MY_REQUESTS_KEY,
    queryFn: () => unwrap(api.GET("/api/v1/access-requests")),
  });
}

export function useSendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: NewAccessRequest) => unwrap(api.POST("/api/v1/access-requests", { body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MY_REQUESTS_KEY }),
  });
}

export function useWithdrawRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap(
        api.POST("/api/v1/access-requests/{request_id}/cancel", {
          params: { path: { request_id: id } },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MY_REQUESTS_KEY }),
  });
}
