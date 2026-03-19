import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[var(--gold)] text-black shadow-[0_10px_30px_rgba(244,200,76,0.28)]",
    secondary: "bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--line)]",
    ghost: "bg-transparent text-[var(--muted)]",
    danger: "bg-[var(--danger)] text-white shadow-[0_10px_30px_rgba(255,107,107,0.22)]",
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
