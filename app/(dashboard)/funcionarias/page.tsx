"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Funcionaria } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Scissors, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FuncionariasPage() {
  const router = useRouter();
  const [funcionarias, setFuncionarias] = useState<Funcionaria[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    api
      .get("/funcionarias")
      .then((res) => setFuncionarias(res.data))
      .catch(() => toast.error("Erro ao carregar funcionárias"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, []);

  const desativar = async (id: string, nome: string) => {
    if (!confirm(`Desativar ${nome}?`)) return;
    try {
      await api.delete(`/funcionarias/${id}`);
      toast.success("Funcionária desativada");
      carregar();
    } catch {
      toast.error("Erro ao desativar funcionária");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Funcionárias</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie as profissionais do salão
          </p>
        </div>
        <Button onClick={() => router.push("/funcionarias/nova")}>
          <Plus size={16} className="mr-2" />
          Nova Funcionária
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : funcionarias.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma funcionária cadastrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {funcionarias.map((f) => (
            <Card key={f.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{f.usuario.nome}</CardTitle>
                  <Badge variant={f.ativo ? "default" : "secondary"}>
                    {f.ativo ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {f.usuario.email}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {f.telefone && <p className="text-sm">{f.telefone}</p>}
                <p className="text-xs text-muted-foreground">
                  Desde{" "}
                  {format(new Date(f.criadoEm), "MMM 'de' yyyy", {
                    locale: ptBR
                  })}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/funcionarias/${f.id}/editar`)}
                  >
                    <Pencil size={14} className="mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/funcionarias/${f.id}/servicos`)
                    }
                  >
                    <Scissors size={14} className="mr-1" />
                    Serviços
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/funcionarias/${f.id}/horarios`)
                    }
                  >
                    <Clock size={14} className="mr-1" />
                    Horários
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => desativar(f.id, f.usuario.nome)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
