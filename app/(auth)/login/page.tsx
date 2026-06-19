"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useConfiguracoes } from "@/hooks/use-configuracoes";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { config } = useConfiguracoes();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", data);
      const { accessToken } = response.data;

      const meResponse = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      setAuth(accessToken, meResponse.data);
      toast.success("Login realizado com sucesso!");
      router.push("/dashboard");
    } catch {
      toast.error("E-mail ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          {config?.logoUrl ? (
            <Image
              src={config.logoUrl}
              alt="Logo"
              width={80}
              height={80}
              className="mx-auto rounded-full object-cover w-20 h-20 mb-2"
            />
          ) : (
            <div className="text-5xl mb-2">💇‍♀️</div>
          )}
          <CardTitle className="text-2xl">
            {config?.nomeSalao ?? "SalãoApp"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Faça login para acessar o painel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@salaoappp.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
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
    </div>
  );
}
