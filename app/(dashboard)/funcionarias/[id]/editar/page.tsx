"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { Funcionaria } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  telefone: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export default function EditarFuncionariaPage() {
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
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    api
      .get<Funcionaria>(`/funcionarias/${id}`)
      .then((res) => {
        reset({
          nome: res.data.usuario.nome,
          telefone: res.data.telefone ?? ""
        });
      })
      .catch(() => toast.error("Funcionária não encontrada"))
      .finally(() => setCarregando(false));
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await api.put(`/funcionarias/${id}`, data);
      toast.success("Funcionária atualizada com sucesso!");
      router.push("/funcionarias");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? "Erro ao atualizar funcionária"
      );
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
          <h1 className="text-2xl font-bold">Editar Funcionária</h1>
          <p className="text-muted-foreground text-sm">
            Atualize os dados da profissional
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da Funcionária</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Nome completo</Label>
              <Input placeholder="Ex: Maria Santos" {...register("nome")} />
              {errors.nome && (
                <p className="text-xs text-red-500">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Telefone (opcional)</Label>
              <Input placeholder="(16) 99999-0000" {...register("telefone")} />
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
