"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { Cliente } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal(""))
});

type FormData = z.infer<typeof schema>;

export default function EditarClientePage() {
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
      .get<Cliente>(`/clientes/${id}`)
      .then((res) => {
        reset({
          nome: res.data.nome,
          telefone: res.data.telefone ?? "",
          email: res.data.email ?? ""
        });
      })
      .catch(() => toast.error("Cliente não encontrado"))
      .finally(() => setCarregando(false));
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await api.put(`/clientes/${id}`, {
        ...data,
        email: data.email || undefined
      });
      toast.success("Cliente atualizado com sucesso!");
      router.push("/clientes");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Erro ao atualizar cliente");
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
          <h1 className="text-2xl font-bold">Editar Cliente</h1>
          <p className="text-muted-foreground text-sm">
            Atualize os dados do cliente
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Nome completo</Label>
              <Input placeholder="Ex: João Silva" {...register("nome")} />
              {errors.nome && (
                <p className="text-xs text-red-500">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Telefone (opcional)</Label>
              <Input placeholder="(16) 99999-0000" {...register("telefone")} />
            </div>

            <div className="space-y-1">
              <Label>E-mail (opcional)</Label>
              <Input
                type="email"
                placeholder="joao@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
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
