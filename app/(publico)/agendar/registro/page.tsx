"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useClienteStore } from "@/hooks/use-cliente-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import apiCliente from "@/lib/api-cliente";

const schema = z
  .object({
    nome: z.string().min(2, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().optional(),
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmarSenha: z.string()
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"]
  });

type FormData = z.infer<typeof schema>;

export default function RegistroClientePage() {
  const router = useRouter();
  const { setAuth } = useClienteStore();
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
      const response = await apiCliente.post("/publico/registrar", {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        senha: data.senha
      });
      setAuth(response.data.accessToken, response.data.cliente);
      toast.success("Conta criada com sucesso!");
      router.push("/agendar");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cadastre-se para agendar seu horário
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Nome completo</Label>
              <Input placeholder="Seu nome" {...register("nome")} />
              {errors.nome && (
                <p className="text-xs text-red-500">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Telefone (opcional)</Label>
              <Input placeholder="(16) 99999-0000" {...register("telefone")} />
            </div>

            <div className="space-y-1">
              <Label>Senha</Label>
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
              <Label>Confirmar senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("confirmarSenha")}
              />
              {errors.confirmarSenha && (
                <p className="text-xs text-red-500">
                  {errors.confirmarSenha.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/agendar/login" className="text-primary font-medium">
          Entrar
        </Link>
      </p>
    </div>
  );
}
