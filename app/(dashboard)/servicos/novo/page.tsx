"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
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

export default function NovoServicoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await api.post("/servicos", data);
      toast.success("Serviço cadastrado com sucesso!");
      router.push("/servicos");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Erro ao cadastrar serviço");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Novo Serviço</h1>
          <p className="text-muted-foreground text-sm">
            Cadastre um novo serviço
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
                {loading ? "Salvando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
