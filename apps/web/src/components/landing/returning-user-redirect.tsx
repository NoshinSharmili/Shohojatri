"use client";

import { useEffect } from "react";

import { homePathFor, useMe } from "@/lib/auth/session";
import { useRouter } from "@/lib/i18n/navigation";

/** Opening the app while logged in goes to your home, in the language you last chose. */
export function ReturningUserRedirect() {
  const me = useMe().data;
  const router = useRouter();

  useEffect(() => {
    if (me) router.replace(homePathFor(me), { locale: me.preferred_locale });
  }, [me, router]);

  return null;
}
