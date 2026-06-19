"use client";

import { useState } from "react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
import { Download, X, Share } from "lucide-react";
import Image from "next/image";

export function PwaInstallBanner() {
  const { installPrompt, isInstalled, isIos, instalar } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  // não mostra se já instalado ou dispensado
  if (isInstalled || dismissed) return null;

  // não mostra se não tem prompt e não é iOS
  if (!installPrompt && !isIos) return null;

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-md p-4 flex items-center gap-3">
      <div className="w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden">
        <Image
          src="/icon-192.png"
          alt="App"
          width={48}
          height={48}
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Instalar o App</p>
        {isIos ? (
          <p className="text-xs text-muted-foreground mt-0.5">
            Toque em <Share size={10} className="inline" /> e depois{" "}
            <strong>Adicionar à Tela de Início</strong>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">
            Acesse mais rápido direto da tela inicial
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {!isIos && (
          <Button size="sm" className="h-8 text-xs" onClick={instalar}>
            <Download size={13} className="mr-1" />
            Instalar
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => setDismissed(true)}
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}
