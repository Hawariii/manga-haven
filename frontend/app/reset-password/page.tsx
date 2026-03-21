"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { api, getApiErrorMessage } from "@/lib/api";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const token = searchParams.get("token") ?? "";
  const presetEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isReady = useMemo(() => token.length > 0, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      showToast("Password berhasil direset. Silakan login lagi.");
      router.push("/login");
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow="Recovery"
        title="Reset password"
        description="Masukkan password baru untuk akunmu. Link reset ini datang dari email."
      />

      {!isReady ? (
        <div className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-5 text-sm leading-6 text-[var(--muted)]">
          Token reset tidak ditemukan. Minta link reset baru dari halaman{" "}
          <Link href="/forgot-password" className="font-semibold text-[var(--gold)]">
            lupa password
          </Link>
          .
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-5"
        >
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email akun"
            type="email"
            className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)]"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password baru"
            type="password"
            className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)]"
          />
          <input
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            placeholder="Konfirmasi password baru"
            type="password"
            className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)]"
          />

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Menyimpan..." : "Simpan Password Baru"}
          </Button>
        </form>
      )}
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-[2rem] bg-white/6" />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
