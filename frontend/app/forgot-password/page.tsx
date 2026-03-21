"use client";

import Link from "next/link";
import { useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { api, getApiErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/forgot-password", { email });
      showToast("Link reset password sudah dikirim.");
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
        title="Lupa password"
        description="Masukkan email akunmu. Kalau terdaftar, kami kirim link reset password ke inbox."
      />

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

        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? "Mengirim..." : "Kirim Link Reset"}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--muted)]">
        Sudah ingat password?{" "}
        <Link href="/login" className="font-semibold text-[var(--gold)]">
          Kembali ke login
        </Link>
      </p>
    </section>
  );
}
