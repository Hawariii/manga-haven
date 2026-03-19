"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { api, getApiErrorMessage } from "@/lib/api";
import { setStoredToken, setStoredUser } from "@/lib/auth";
import type { ApiResponse, User } from "@/lib/types";

type AuthFormCardProps = {
  mode: "login" | "register" | "admin-login";
};

export function AuthFormCard({ mode }: AuthFormCardProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const config = {
    login: {
      eyebrow: "Login",
      title: "Masuk sebagai user",
      description: "User biasa bisa menyimpan favorite dan melihat history baca.",
      endpoint: "/login",
      submitText: "Masuk",
      showName: false,
      showConfirmation: false,
      footerText: "Belum punya akun?",
      footerHref: "/register",
      footerLink: "Register",
    },
    register: {
      eyebrow: "Register",
      title: "Buat akun user baru",
      description: "Guest tetap bisa baca manga, tapi favorite dan history butuh akun.",
      endpoint: "/register",
      submitText: "Daftar",
      showName: true,
      showConfirmation: true,
      footerText: "Sudah punya akun?",
      footerHref: "/login",
      footerLink: "Login",
    },
    "admin-login": {
      eyebrow: "Admin",
      title: "Masuk ke admin panel",
      description: "Hanya role admin yang bisa upload manga dan chapter target.",
      endpoint: "/admin/login",
      submitText: "Masuk Admin",
      showName: false,
      showConfirmation: false,
      footerText: "Kembali ke user login?",
      footerHref: "/login",
      footerLink: "User Login",
    },
  }[mode];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload =
        mode === "register"
          ? form
          : {
              email: form.email,
              password: form.password,
              device_name: mode === "admin-login" ? "manga-haven-admin-panel" : "manga-haven-web",
            };

      const response = await api.post<ApiResponse<{ token: string; user: User }>>(
        config.endpoint,
        payload,
      );

      setStoredToken(response.data.data.token);
      setStoredUser(response.data.data.user);
      showToast(response.data.message);

      const next = searchParams.get("next");

      if (mode === "admin-login") {
        router.push(next || "/admin/manga");
      } else {
        router.push(next || "/profile");
      }
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-5"
      >
        {config.showName ? (
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Nama lengkap"
            className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)]"
          />
        ) : null}

        <input
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="Email"
          type="email"
          className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)]"
        />

        <input
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="Password"
          type="password"
          className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)]"
        />

        {config.showConfirmation ? (
          <input
            value={form.password_confirmation}
            onChange={(event) =>
              setForm((current) => ({ ...current, password_confirmation: event.target.value }))
            }
            placeholder="Konfirmasi password"
            type="password"
            className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)]"
          />
        ) : null}

        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? "Memproses..." : config.submitText}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--muted)]">
        {config.footerText}{" "}
        <Link href={config.footerHref} className="font-semibold text-[var(--gold)]">
          {config.footerLink}
        </Link>
      </p>
    </section>
  );
}
