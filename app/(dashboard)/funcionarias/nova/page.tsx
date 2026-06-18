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
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  telefone: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export default function NovaFuncionariaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await api.post("/funcionarias", data);
      toast.success("Funcionária cadastrada com sucesso!");
      router.push("/funcionarias");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? "Erro ao cadastrar funcionária"
      );
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
          <h1 className="text-2xl font-bold">Nova Funcionária</h1>
          <p className="text-muted-foreground text-sm">
            Cadastre uma nova profissional
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
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="maria@salaoappp.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Senha inicial</Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("senha")}
              />
              {errors.senha && (
                <p className="text-xs text-red-500">{errors.senha.message}</p>
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
                {loading ? "Salvando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
