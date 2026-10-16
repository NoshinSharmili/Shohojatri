"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { CHILDREN_KEY, childKey } from "@/lib/children/queries";

export type IncomingRequest = components["schemas"]["IncomingAccessRequest"];
export type Grant = components["schemas"]["Grant"];
export type ActivityEntry = components["schemas"]["ActivityEntry"];
export type ScopeOptions = components["schemas"]["ApproveAccessRequest"];

const path = (childId: number) => ({ params: { path: { child_id: childId } } });

// The parent's Care team page. Every key sits under the child's, and every change invalidates
// all children: pending counts, codes and member lists move together.

export function useIncomingRequests(childId: number) {
  return useQuery({
    queryKey: [...childKey(childId), "access-requests"],
    queryFn: () => unwrap(api.GET("/api/v1/children/{child_id}/access-requests", path(childId))),
  });
}

export function useGrants(childId: number) {
  return useQuery({
    queryKey: [...childKey(childId), "grants"],
    queryFn: () => unwrap(api.GET("/api/v1/children/{child_id}/grants", path(childId))),
  });
}

export function useActivity(childId: number) {
  return useQuery({
    queryKey: [...childKey(childId), "activity"],
    queryFn: () => unwrap(api.GET("/api/v1/children/{child_id}/activity", path(childId))),
  });
}

function useCareTeamMutation<T>(mutationFn: (variables: T) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHILDREN_KEY }),
  });
}

export function useDecideRequest() {
  return useCareTeamMutation(
    ({ id, approve, options }: { id: number; approve: boolean; options?: ScopeOptions }) => {
      const params = { params: { path: { request_id: id } } };
      return approve
        ? unwrap(
            api.POST("/api/v1/access-requests/{request_id}/approve", {
              ...params,
              body: options ?? {},
            }),
          )
        : unwrap(api.POST("/api/v1/access-requests/{request_id}/decline", params));
    },
  );
}

export function useUpdateGrant() {
  return useCareTeamMutation(({ id, options }: { id: number; options: ScopeOptions }) =>
    unwrap(
      api.PATCH("/api/v1/grants/{grant_id}", {
        params: { path: { grant_id: id } },
        body: options,
      }),
    ),
  );
}

export function useRevokeGrant() {
  return useCareTeamMutation((id: number) =>
    unwrap(api.DELETE("/api/v1/grants/{grant_id}", { params: { path: { grant_id: id } } })),
  );
}

export function useRegenerateCode(childId: number) {
  return useCareTeamMutation(() =>
    unwrap(api.POST("/api/v1/children/{child_id}/regenerate-code", path(childId))),
  );
}
