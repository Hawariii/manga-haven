import { Suspense } from "react";
import { AuthFormCard } from "@/components/auth/AuthFormCard";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-[2rem] bg-white/6" />}>
      <AuthFormCard mode="admin-login" />
    </Suspense>
  );
}
