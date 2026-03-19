import { Suspense } from "react";
import { AuthFormCard } from "@/components/auth/AuthFormCard";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-[2rem] bg-white/6" />}>
      <AuthFormCard mode="login" />
    </Suspense>
  );
}
