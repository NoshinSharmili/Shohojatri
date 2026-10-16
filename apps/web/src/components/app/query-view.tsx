"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { StateView } from "@/components/ui/state-view";
import { useErrorMessage } from "@/lib/api/error-message";

type QueryViewProps<T> = {
  query: UseQueryResult<T>;
  /** Shown instead of `children` when the data is empty (e.g. an empty list). */
  empty?: ReactNode;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
};

/** Loading, error (with retry) and empty states for one query, the same way everywhere. */
export function QueryView<T>({
  query,
  empty,
  isEmpty = (data) => Array.isArray(data) && data.length === 0,
  children,
}: QueryViewProps<T>) {
  const t = useTranslations("common");
  const errorMessage = useErrorMessage();

  if (query.isPending) return <StateView kind="loading" title={t("loading")} />;
  if (query.isError) {
    return (
      <StateView
        kind="error"
        message={errorMessage(query.error)}
        action={
          <Button
            variant="secondary"
            loading={query.isFetching}
            onClick={() => void query.refetch()}
          >
            {t("retry")}
          </Button>
        }
      />
    );
  }
  if (empty !== undefined && isEmpty(query.data)) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
