"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClienteStore } from "@/hooks/use-cliente-store";
import { useConfiguracoes } from "@/hooks/use-configuracoes";
import apiCliente from "@/lib/api-cliente";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  LogIn,
  UserPlus,
  LogOut,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Images
} from "lucide-react";
import Image from "next/image";
import { Servico, ImagemGaleria } from "@/types";
import axios from "axios";

export default function AgendarPage() {
  const router = useRouter();
  const { cliente, logout } = useClienteStore();
  const { config } = useConfiguracoes();
  const [hydrated, setHydrated] = useState(false);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [galeria, setGaleria] = useState<ImagemGaleria[]>([]);

  useEffect(() => {
    setHydrated(true);

    // carrega serviços e galeria publicamente
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/publico/servicos`)
      .then((res) => setServicos(res.data));

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/configuracoes/publica`)
      .then(() => {});

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
    <div className="space-y-10 pb-10">
      {/* Hero */}
      <div className="text-center py-8 space-y-4">
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
        <h1 className="text-3xl font-bold">
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

      {/* Serviços */}
      {servicos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            ✂️ Nossos Serviços
          </h2>
          <div className="space-y-3">
            {servicos.map((s) => (
              <div
                key={s.id}
                className="flex items-stretch rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm"
              >
                <div className="relative w-24 h-24 flex-shrink-0">
                  {s.imagemUrl ? (
                    <Image
                      src={s.imagemUrl}
                      alt={s.nome}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                      <span className="text-3xl">💅</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 px-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{s.nome}</p>
                    {s.descricao && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.descricao}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={11} />
                        {s.duracaoMinutos} min
                      </span>
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        <DollarSign size={11} />
                        R$ {Number(s.preco).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            className="w-full"
            onClick={() =>
              router.push(cliente ? "/agendar/novo" : "/agendar/login")
            }
          >
            <CalendarDays size={16} className="mr-2" />
            Agendar agora
          </Button>
        </div>
      )}

      {/* Galeria */}
      {galeria.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Images size={18} /> Nossa Galeria
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {galeria.slice(0, 6).map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-xl overflow-hidden"
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
