"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClienteStore } from "@/hooks/use-cliente-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CalendarDays, Clock, DollarSign } from "lucide-react";
import apiCliente from "@/lib/api-cliente";

const statusColor: Record<string, string> = {
  AGENDADO: "bg-blue-100 text-blue-700",
  CONFIRMADO: "bg-green-100 text-green-700",
  CONCLUIDO: "bg-gray-100 text-gray-700",
  CANCELADO: "bg-red-100 text-red-700"
};

const statusLabel: Record<string, string> = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado"
};

interface AgendamentoCliente {
  id: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: string;
  observacao?: string;
  funcionaria: { usuario: { nome: string } };
  servico: { nome: string; duracaoMinutos: number; preco: string };
}

export default function MeusAgendamentosPage() {
  const router = useRouter();
  const { token, cliente } = useClienteStore();
  const [hydrated, setHydrated] = useState(false);
  const [agendamentos, setAgendamentos] = useState<AgendamentoCliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !token) router.push("/agendar/login");
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!token) return;
    apiCliente
      .get("/publico/meus-agendamentos")
      .then((res) => setAgendamentos(res.data))
      .catch(() => toast.error("Erro ao carregar agendamentos"))
      .finally(() => setLoading(false));
  }, [token]);

  const cancelar = async (id: string) => {
    if (!confirm("Cancelar este agendamento?")) return;
    try {
      await apiCliente.patch(`/publico/agendamentos/${id}/cancelar`, {});
      toast.success("Agendamento cancelado");
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "CANCELADO" } : a))
      );
    } catch {
      toast.error("Erro ao cancelar agendamento");
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/agendar")}
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Meus Agendamentos</h1>
          <p className="text-muted-foreground text-sm">{cliente?.nome}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : agendamentos.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <CalendarDays size={48} className="mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            Você ainda não tem agendamentos.
          </p>
          <Button onClick={() => router.push("/agendar/novo")}>
            Agendar agora
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {agendamentos.map((a) => (
            <Card key={a.id}>
              <CardContent className="py-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{a.servico.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      com {a.funcionaria.usuario.nome}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[a.status]}`}
                  >
                    {statusLabel[a.status]}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={13} />
                    {format(
                      new Date(a.dataHoraInicio),
                      "dd 'de' MMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {format(new Date(a.dataHoraInicio), "HH:mm")}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={13} />
                    R$ {Number(a.servico.preco).toFixed(2)}
                  </span>
                </div>

                {a.observacao && (
                  <p className="text-xs text-muted-foreground italic">
                    "{a.observacao}"
                  </p>
                )}

                {a.status === "AGENDADO" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-500 hover:text-red-600"
                    onClick={() => cancelar(a.id)}
                  >
                    Cancelar agendamento
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
