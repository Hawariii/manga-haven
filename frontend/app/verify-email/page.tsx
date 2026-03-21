"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/Button";

function VerifyEmailSentInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const resent = searchParams.get("resent") === "1";

  return (
    <section className="space-y-5">
      <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--surface)] p-5 lg:p-6">
        <SectionHeading
          eyebrow="Verify Email"
          title={resent ? "Email verifikasi dikirim ulang" : "Cek inbox email kamu"}
          description="Kami kirim link verifikasi ke email akunmu. Klik link itu dulu sebelum pakai history, favorite, atau panel admin."
        />
      </div>

      <div className="space-y-4 rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/8 p-4 text-sm leading-6 text-[var(--muted)]">
          <p className="font-semibold text-[var(--foreground)]">
            {resent ? "Link baru sudah dikirim." : "Registrasi berhasil."}
          </p>
          <p className="mt-2">
            {email ? (
              <>
                Target email: <span className="font-semibold text-[var(--foreground)]">{email}</span>
              </>
            ) : (
              "Email tujuan sudah tercatat di akunmu."
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-white/3 p-4 text-sm leading-6 text-[var(--muted)]">
          Kalau email belum masuk:
          <br />
          cek folder spam/promotions, pastikan alamat email benar, lalu kirim ulang dari halaman profile setelah login.
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/login">
            <Button className="w-full">Ke Login</Button>
          </Link>
          <Link href="/profile">
            <Button className="w-full" variant="secondary">
              Buka Profile
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-[2rem] bg-white/6" />}>
      <VerifyEmailSentInner />
    </Suspense>
  );
}
