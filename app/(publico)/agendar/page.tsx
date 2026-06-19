"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClienteStore } from "@/hooks/use-cliente-store";
import { useConfiguracoes } from "@/hooks/use-configuracoes";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  LogIn,
  UserPlus,
  LogOut,
  MapPin,
  Phone
} from "lucide-react";
import Image from "next/image";
import { ImagemGaleria } from "@/types";
import axios from "axios";

export default function AgendarPage() {
  const router = useRouter();
  const { cliente, logout } = useClienteStore();
  const { config } = useConfiguracoes();
  const [hydrated, setHydrated] = useState(false);
  const [galeria, setGaleria] = useState<ImagemGaleria[]>([]);

  useEffect(() => {
    setHydrated(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/galeria/publica`)
      .then((res) => setGaleria(res.data))
      .catch(() => {});
  }, []);

  if (!hydrated) return null;

  const handleLogout = () => {
    logout();
    router.refresh();
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hero */}
      <div className="text-center py-6 space-y-3">
        {config?.logoUrl ? (
          <Image
            src={config.logoUrl}
            alt="Logo"
            width={100}
            height={100}
            className="mx-auto rounded-full object-cover w-24 h-24 shadow-md"
          />
        ) : (
          <div className="text-6xl">💇‍♀️</div>
        )}
        <h1 className="text-2xl font-bold">
          {config?.nomeSalao ?? "Bem-vinda!"}
        </h1>

        <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
          {config?.endereco && (
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {config.endereco}
            </span>
          )}
          {config?.cidade && <span>{config.cidade}</span>}
          {config?.telefone && (
            <span className="flex items-center gap-1">
              <Phone size={13} />
              {config.telefone}
            </span>
          )}
        </div>

        {/* Botões */}
        {cliente ? (
          <div className="space-y-3 pt-2">
            <div className="bg-pink-50 rounded-xl p-3 text-sm">
              Olá, <span className="font-semibold">{cliente.nome}</span> 👋
            </div>
            <Button
              className="w-full h-12 text-base"
              onClick={() => router.push("/agendar/novo")}
            >
              <CalendarDays size={18} className="mr-2" />
              Agendar Horário
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/agendar/meus-agendamentos")}
              >
                Meus Agendamentos
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 h-12"
              onClick={() => router.push("/agendar/login")}
            >
              <LogIn size={18} className="mr-2" />
              Entrar
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => router.push("/agendar/registro")}
            >
              <UserPlus size={16} className="mr-2" />
              Criar conta
            </Button>
          </div>
        )}
      </div>

      {/* Galeria */}
      {galeria.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">✨ Nossa Galeria</h2>
          <div className="grid grid-cols-2 gap-2">
            {galeria.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-xl overflow-hidden shadow-sm"
              >
                <Image
                  src={img.url}
                  alt={img.titulo ?? "Galeria"}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
