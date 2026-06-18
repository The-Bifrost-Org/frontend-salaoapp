"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useClienteStore } from "@/hooks/use-cliente-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import apiCliente from "@/lib/api-cliente";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
});

type FormData = z.infer<typeof schema>;

export default function LoginClientePage() {
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
      const response = await apiCliente.post("/publico/login", data);
      setAuth(response.data.accessToken, response.data.cliente);
      toast.success("Login realizado com sucesso!");
      router.push("/agendar");
    } catch {
      toast.error("E-mail ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acesse sua conta para agendar
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/agendar/registro" className="text-primary font-medium">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
