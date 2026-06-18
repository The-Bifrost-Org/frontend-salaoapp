"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Agendamento } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export default function AgendamentosPage() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(format(new Date(), "yyyy-MM-dd"));

  const carregar = (dataSelecionada: string) => {
    setLoading(true);
    api
      .get(`/agendamentos?data=${dataSelecionada}`)
      .then((res) => setAgendamentos(res.data))
      .catch(() => toast.error("Erro ao carregar agendamentos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar(data);
  }, [data]);

  const atualizarStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/agendamentos/${id}/status`, { status });
      toast.success("Status atualizado!");
      carregar(data);
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie a agenda do salão
          </p>
        </div>
        <Button onClick={() => router.push("/agendamentos/novo")}>
          <Plus size={16} className="mr-2" />
          Novo
        </Button>
      </div>

      {/* Filtro por data */}
      <div className="flex items-center gap-3">
        <Input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-48"
        />
        <Button
          variant="outline"
          onClick={() => setData(format(new Date(), "yyyy-MM-dd"))}
        >
          Hoje
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : agendamentos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum agendamento para este dia.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {agendamentos.map((a) => (
            <Card key={a.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-sm font-medium text-muted-foreground w-12 pt-0.5">
                      {format(new Date(a.dataHoraInicio), "HH:mm")}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{a.cliente.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.servico.nome} · {a.funcionaria.usuario.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        até {format(new Date(a.dataHoraFim), "HH:mm")} · R${" "}
                        {Number(a.servico.preco).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[a.status]}`}
                    >
                      {statusLabel[a.status]}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/agendamentos/${a.id}`)}
                    >
                      <Pencil size={14} />
                    </Button>
                  </div>
                </div>

                {/* Ações de status */}
                {a.status === "AGENDADO" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-green-600"
                      onClick={() => atualizarStatus(a.id, "CONFIRMADO")}
                    >
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-500"
                      onClick={() => atualizarStatus(a.id, "CANCELADO")}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
                {a.status === "CONFIRMADO" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-gray-600"
                      onClick={() => atualizarStatus(a.id, "CONCLUIDO")}
                    >
                      Concluir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-500"
                      onClick={() => atualizarStatus(a.id, "CANCELADO")}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
