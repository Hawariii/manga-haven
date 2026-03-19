"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeading } from "@/components/SectionHeading";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { api, getApiErrorMessage } from "@/lib/api";
import { clearSession, getStoredToken, getStoredUser, setStoredUser } from "@/lib/auth";
import type { ApiResponse, User } from "@/lib/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      const token = getStoredToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<ApiResponse<{ user: User }>>("/user");
        setUser(response.data.data.user);
        setStoredUser(response.data.data.user);
      } catch (err) {
        showToast(getApiErrorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [showToast]);

  async function handleLogout() {
    try {
      if (getStoredToken()) {
        await api.post("/logout");
      }
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      clearSession();
      setUser(null);
      showToast("Sesi login sudah dibersihkan.");
    }
  }

  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow="Profile"
        title="Akun Pengguna"
        description="Status login, info user, dan tombol logout disiapkan di halaman ini."
      />

      {loading ? (
        <div className="space-y-3 rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="h-5 w-24 animate-pulse rounded-full bg-white/6" />
          <div className="h-10 w-full animate-pulse rounded-2xl bg-white/6" />
          <div className="h-10 w-full animate-pulse rounded-2xl bg-white/6" />
        </div>
      ) : user ? (
        <div className="space-y-4 rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,_rgba(255,224,120,0.28),_rgba(255,224,120,0.08))] text-xl font-black text-[var(--gold)]">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-white">{user.name}</p>
              <p className="text-sm text-[var(--muted)]">{user.email}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white/3 p-4 text-sm leading-6 text-[var(--muted)]">
            Token Sanctum aktif terdeteksi di browser. Frontend siap dipakai untuk request terproteksi.
          </div>

          <Button variant="danger" className="w-full" onClick={() => void handleLogout()}>
            Logout
          </Button>
        </div>
      ) : (
        <EmptyState
          title="Mode tamu aktif"
          description="Belum ada token login Sanctum di browser. Nanti setelah flow auth disambung, info user akan tampil di sini."
        />
      )}
    </section>
  );
}
