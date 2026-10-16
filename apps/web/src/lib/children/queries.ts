"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type ChildSummary = components["schemas"]["ChildOut"];
export type NewChild = components["schemas"]["CreateChildRequest"];

/** Everything about children lives under this key, so one invalidation refreshes it all. */
export const CHILDREN_KEY = ["children"] as const;
export const childKey = (childId: number) => [...CHILDREN_KEY, childId] as const;

/** The children on the viewer's home (own children, or those a member was approved for). */
export function useChildren() {
  return useQuery({
    queryKey: CHILDREN_KEY,
    queryFn: () => unwrap(api.GET("/api/v1/children")),
  });
}

export function useChild(childId: number) {
  return useQuery({
    queryKey: [...childKey(childId), "summary"],
    queryFn: () =>
      unwrap(api.GET("/api/v1/children/{child_id}", { params: { path: { child_id: childId } } })),
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: NewChild) => unwrap(api.POST("/api/v1/children", { body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHILDREN_KEY }),
  });
}

/** 38 → "3 years 2 months" / "৩ বছর ২ মাস". */
export function useFormatAge(): (months: number) => string {
  const t = useTranslations("children");
  return (months) => {
    const years = Math.floor(months / 12);
    const rest = months % 12;
    const parts = [];
    if (years > 0) parts.push(t("years", { count: years }));
    if (rest > 0 || years === 0) parts.push(t("months", { count: rest }));
    return parts.join(" ");
  };
}
