/**
 * Merges class names, filtering out falsy values.
 * Minimal cn() without clsx/tailwind-merge overhead.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
