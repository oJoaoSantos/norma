import type { ButtonHTMLAttributes } from "react";

const VARIANTS = {
  default:
    "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
  danger:
    "border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950",
} as const;

export function ActionButton({
  variant = "default",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof VARIANTS }) {
  return (
    <button
      {...props}
      className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    />
  );
}
