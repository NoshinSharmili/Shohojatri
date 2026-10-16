"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { api, ApiRequestError, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type Me = components["schemas"]["UserOut"];
export type Role = Me["role"];

export const ME_KEY = ["me"] as const;

const HOME: Record<Role, string> = {
  parent: "/home",
  teacher: "/teacher",
  specialist: "/specialist",
  admin: "/admin",
};

/** Where a user lands after logging in (locale-less path, for the next-intl router). */
export function homePathFor(user: Me): string {
  return user.must_change_password ? "/set-password" : HOME[user.role];
}

/** The logged-in user, or null when nobody is logged in. Errors only for real failures. */
export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: async (): Promise<Me | null> => {
      try {
        return await unwrap(api.GET("/api/v1/me"));
      } catch (error) {
        // The client has already tried to refresh the session before this 401.
        if (error instanceof ApiRequestError && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  });
}

/** Stores the user returned by login / sign-up / password change, so guards see it at once. */
export function useSetMe(): (user: Me) => void {
  const queryClient = useQueryClient();
  return (user) => queryClient.setQueryData(ME_KEY, user);
}

/** Saves the language choice for a logged-in user (CLAUDE.md §6). Failures are harmless. */
export function useSaveLocale(): (locale: Me["preferred_locale"]) => void {
  const queryClient = useQueryClient();
  return (locale) => {
    const me = queryClient.getQueryData<Me | null>(ME_KEY);
    if (!me || me.must_change_password || me.preferred_locale === locale) return;
    void unwrap(api.PATCH("/api/v1/me", { body: { preferred_locale: locale } })).then(
      (user) => queryClient.setQueryData(ME_KEY, user),
      () => undefined,
    );
  };
}

/** Logs out and reloads the app, which also wipes any child data held in memory. */
export function useLogout(): () => Promise<void> {
  const locale = useLocale();
  return async () => {
    // Even if the request fails, the full reload drops the in-memory session state.
    await api.POST("/api/v1/auth/logout").catch(() => undefined);
    // Deliberately not router.push: that would keep the query cache (and child data) alive.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/${locale}/login`);
  };
}

/** Only same-app paths are accepted as a post-login destination (no open redirects). */
export function safeNextPath(next: string | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  return next;
}
