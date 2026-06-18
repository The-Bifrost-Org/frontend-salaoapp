"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { Servico } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  descricao: z.string().optional(),
  duracaoMinutos: z.coerce.number().min(1, "Duração mínima é 1 minuto"),
  preco: z.coerce.number().min(0.01, "Preço inválido")
});

type FormData = z.infer<typeof schema>;

export default function EditarServicoPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any
  });

  useEffect(() => {
    api
      .get<Servico>(`/servicos/${id}`)
      .then((res) => {
        reset({
          nome: res.data.nome,
          descricao: res.data.descricao ?? "",
          duracaoMinutos: res.data.duracaoMinutos,
          preco: Number(res.data.preco)
        });
      })
      .catch(() => toast.error("Serviço não encontrado"))
      .finally(() => setCarregando(false));
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await api.put(`/servicos/${id}`, data);
      toast.success("Serviço atualizado com sucesso!");
      router.push("/servicos");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Erro ao atualizar serviço");
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
          <h1 className="text-2xl font-bold">Editar Serviço</h1>
          <p className="text-muted-foreground text-sm">
            Atualize os dados do serviço
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Escova progressiva"
                {...register("nome")}
              />
              {errors.nome && (
                <p className="text-xs text-red-500">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Descrição (opcional)</Label>
              <Input
                placeholder="Ex: Alisamento com keratina"
                {...register("descricao")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Duração (minutos)</Label>
                <Input
                  type="number"
                  placeholder="60"
                  {...register("duracaoMinutos")}
                />
                {errors.duracaoMinutos && (
                  <p className="text-xs text-red-500">
                    {errors.duracaoMinutos.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="80.00"
                  {...register("preco")}
                />
                {errors.preco && (
                  <p className="text-xs text-red-500">{errors.preco.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
