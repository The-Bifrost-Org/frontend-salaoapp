"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth-store";
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated) return null;
  if (!token) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 pt-20 md:pt-6">
        {children}
      </main>
    </div>
  );
}
