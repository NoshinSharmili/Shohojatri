import { notFound } from "next/navigation";

/** The `[id]` route segment as a screening id, or a 404. */
export async function screeningIdFrom(params: Promise<{ id: string }>): Promise<number> {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return id;
}
