import { type Messages, useTranslations } from "next-intl";

import { ApiRequestError } from "./client";

type ErrorMessageKey = keyof Messages["errors"];

/** Key in the "errors" namespace for any thrown value. The API sends `errors.x` as message_key. */
function errorKey(error: unknown): string {
  if (!(error instanceof ApiRequestError)) return "unknown";
  if (error.status === null) return "network";
  if (error.body) return error.body.error.message_key.replace(/^errors\./, "");
  // Our API always sends the error shape, so a bare 5xx means a proxy couldn't reach it.
  return error.status >= 500 ? "network" : "unknown";
}

/** Returns a function that turns any error into a translated, user-facing message. */
export function useErrorMessage(): (error: unknown) => string {
  const t = useTranslations("errors");
  return (error) => {
    // The server may send a key the catalogue doesn't have yet; never show a raw key.
    const key = errorKey(error) as ErrorMessageKey;
    return t.has(key) ? t(key) : t("unknown");
  };
}
