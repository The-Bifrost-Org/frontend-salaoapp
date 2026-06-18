"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClienteStore } from "@/hooks/use-cliente-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, LogIn, UserPlus, LogOut } from "lucide-react";

export default function AgendarPage() {
  const router = useRouter();
  const { cliente, logout } = useClienteStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) return null;

  const handleLogout = () => {
    logout();
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Boas vindas */}
      <div className="text-center py-6">
        <div className="text-5xl mb-3">💇‍♀️</div>
        <h1 className="text-2xl font-bold">Bem-vinda ao Salão!</h1>
        <p className="text-muted-foreground mt-1">
          Agende seu horário de forma rápida e fácil
        </p>
      </div>

      {cliente ? (
        // Cliente logado
        <div className="space-y-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Olá,</p>
              <p className="font-bold text-lg">{cliente.nome} 👋</p>
            </CardContent>
          </Card>

          <Button
            className="w-full h-14 text-base"
            onClick={() => router.push("/agendar/novo")}
          >
            <CalendarDays size={20} className="mr-2" />
            Agendar Horário
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/agendar/meus-agendamentos")}
          >
            Meus Agendamentos
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Sair
          </Button>
        </div>
      ) : (
        // Cliente não logado
        <div className="space-y-3">
          <Button
            className="w-full h-14 text-base"
            onClick={() => router.push("/agendar/login")}
          >
            <LogIn size={20} className="mr-2" />
            Entrar
          </Button>

          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => router.push("/agendar/registro")}
          >
            <UserPlus size={18} className="mr-2" />
            Criar conta
          </Button>
        </div>
      )}
    </div>
  );
}
