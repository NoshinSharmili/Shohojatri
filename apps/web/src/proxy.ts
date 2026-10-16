import createMiddleware from "next-intl/middleware";

import { routing } from "@/lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except the API rewrite, Next internals and files with an extension (images, icons).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
