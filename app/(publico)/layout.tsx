"use client";

import { useConfiguracoes } from "@/hooks/use-configuracoes";
import Image from "next/image";

export default function PublicoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { config } = useConfiguracoes();

  return (
    <div className="min-h-screen bg-pink-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
          {config?.logoUrl ? (
            <Image
              src={config.logoUrl}
              alt="Logo"
              width={28}
              height={28}
              className="rounded-md object-cover w-7 h-7"
            />
          ) : (
            <span className="text-xl">💇‍♀️</span>
          )}
          <span className="font-bold">{config?.nomeSalao ?? "SalãoApp"}</span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
