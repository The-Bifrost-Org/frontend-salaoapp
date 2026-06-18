"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Funcionaria, Servico } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function FuncionariaServicosPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [funcionaria, setFuncionaria] = useState<Funcionaria | null>(null);
  const [todosServicos, setTodosServicos] = useState<Servico[]>([]);
  const [servicosAtivos, setServicosAtivos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/funcionarias/${id}`), api.get("/servicos")])
      .then(([f, s]) => {
        setFuncionaria(f.data);
        setTodosServicos(s.data);
        // IDs dos serviços que a funcionária já tem
        const idsAtivos = f.data.servicos?.map((fs: any) => fs.servicoId) ?? [];
        setServicosAtivos(idsAtivos);
      })
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setCarregando(false));
  }, [id]);

  const toggleServico = (servicoId: string) => {
    setServicosAtivos((prev) =>
      prev.includes(servicoId)
        ? prev.filter((s) => s !== servicoId)
        : [...prev, servicoId]
    );
  };

  const salvar = async () => {
    try {
      setLoading(true);
      await api.put(`/funcionarias/${id}/servicos`, {
        servicoIds: servicosAtivos
      });
      toast.success("Serviços atualizados com sucesso!");
      router.push("/funcionarias");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Erro ao salvar serviços");
    } finally {
      setLoading(false);
    }
  };

  if (carregando)
    return <p className="text-muted-foreground text-sm">Carregando...</p>;

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Serviços da Funcionária</h1>
          <p className="text-muted-foreground text-sm">
            {funcionaria?.usuario.nome}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Selecione os serviços que esta profissional realiza:
      </p>

      <div className="space-y-3">
        {todosServicos.map((s) => {
          const ativo = servicosAtivos.includes(s.id);
          return (
            <Card
              key={s.id}
              className={`cursor-pointer transition-all ${ativo ? "border-primary ring-1 ring-primary" : ""}`}
              onClick={() => toggleServico(s.id)}
            >
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.nome}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} />
                      {s.duracaoMinutos} min
                    </span>
                    <span className="text-xs font-medium flex items-center gap-1">
                      <DollarSign size={12} />
                      R$ {Number(s.preco).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    ativo ? "bg-primary border-primary" : "border-gray-300"
                  }`}
                >
                  {ativo && <Check size={14} className="text-white" />}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button className="flex-1" disabled={loading} onClick={salvar}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
