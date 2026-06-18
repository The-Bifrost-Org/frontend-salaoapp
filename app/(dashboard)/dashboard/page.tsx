"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/hooks/use-auth-store";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Scissors, UserCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Agendamento } from "@/types";

export default function DashboardPage() {
  const { usuario } = useAuthStore();
  const [agendamentosHoje, setAgendamentosHoje] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hoje = format(new Date(), "yyyy-MM-dd");
    api
      .get(`/agendamentos?data=${hoje}`)
      .then((res) => setAgendamentosHoje(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    AGENDADO: "bg-blue-100 text-blue-700",
    CONFIRMADO: "bg-green-100 text-green-700",
    CONCLUIDO: "bg-gray-100 text-gray-700",
    CANCELADO: "bg-red-100 text-red-700"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Olá, {usuario?.nome?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agendamentos hoje
            </CardTitle>
            <CalendarDays size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{agendamentosHoje.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmados
            </CardTitle>
            <Users size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {agendamentosHoje.filter((a) => a.status === "CONFIRMADO").length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Concluídos
            </CardTitle>
            <Scissors size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {agendamentosHoje.filter((a) => a.status === "CONCLUIDO").length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cancelados
            </CardTitle>
            <UserCircle size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {agendamentosHoje.filter((a) => a.status === "CANCELADO").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agendamentos de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : agendamentosHoje.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum agendamento para hoje.
            </p>
          ) : (
            <div className="space-y-3">
              {agendamentosHoje.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-muted-foreground w-12">
                      {format(new Date(a.dataHoraInicio), "HH:mm")}
                    </div>
                    <div>
                      <p className="font-medium">{a.cliente.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.servico.nome} · {a.funcionaria.usuario.nome}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[a.status]}`}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
