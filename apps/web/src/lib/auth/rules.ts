// Client-side mirrors of the API's checks (apps/api/app/core/security.py), so forms can say
// what's wrong before submitting. The API stays the authority.

export const PASSWORD_MIN_LENGTH = 8;

export function passwordChecks(password: string) {
  return { minLength: password.length >= PASSWORD_MIN_LENGTH, digit: /\d/.test(password) };
}

export function passwordIsAcceptable(password: string): boolean {
  const checks = passwordChecks(password);
  return checks.minLength && checks.digit;
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Bangladeshi mobile number in any common form (Bangla digits too) → +8801XXXXXXXXX. */
export function normalizePhone(value: string): string | null {
  const latin = value.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
  const match = /^(?:\+?880|0)?(1[3-9]\d{8})$/.exec(latin.replace(/[\s\-()]/g, ""));
  return match ? `+880${match[1]}` : null;
}

/** +8801712345678 → 01712-345678, in Bangla digits for bn. */
export function formatPhone(phone: string, locale: string): string {
  const local = phone.replace(/^\+880/, "0");
  const formatted = local.length === 11 ? `${local.slice(0, 5)}-${local.slice(5)}` : local;
  return locale === "bn" ? formatted.replace(/\d/g, (d) => BN_DIGITS[Number(d)]) : formatted;
}
