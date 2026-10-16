/** YYYY-MM-DD in Bangladesh, whatever the device's timezone. */
export function todayInBangladesh(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

/** Completed months between two YYYY-MM-DD dates, as the API counts them (core/dates.py). */
export function ageInMonths(dob: string, today: string = todayInBangladesh()): number {
  const [by, bm, bd] = dob.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  return Math.max(months, 0);
}
