import type bn from "../../../messages/bn.json";
import type en from "../../../messages/en.json";

// Compile-time guard for CLAUDE.md §6: bn.json and en.json must have exactly the same keys.
// `pnpm typecheck` fails here if a string was added to only one of them.
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;

export type MessagesHaveSameKeys = Assert<Same<typeof bn, typeof en>>;
