"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/hooks/use-auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Mail } from "lucide-react";

const nomeSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório")
});

const senhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
    novaSenha: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
    confirmarSenha: z.string()
  })
  .refine((d) => d.novaSenha === d.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"]
  });

type NomeForm = z.infer<typeof nomeSchema>;
type SenhaForm = z.infer<typeof senhaSchema>;

export default function PerfilPage() {
  const { usuario, setAuth, token } = useAuthStore();
  const [loadingNome, setLoadingNome] = useState(false);
  const [loadingSenha, setLoadingSenha] = useState(false);

  const {
    register: regNome,
    handleSubmit: handleNome,
    reset: resetNome,
    formState: { errors: errorsNome }
  } = useForm<NomeForm>({
    resolver: zodResolver(nomeSchema),
    defaultValues: { nome: usuario?.nome ?? "" }
  });

  const {
    register: regSenha,
    handleSubmit: handleSenha,
    reset: resetSenha,
    formState: { errors: errorsSenha }
  } = useForm<SenhaForm>({
    resolver: zodResolver(senhaSchema)
  });

  const onSaveNome = async (data: NomeForm) => {
    try {
      setLoadingNome(true);
      await api.put("/auth/perfil", { nome: data.nome });

      const meRes = await api.get("/auth/me");
      if (token) setAuth(token, meRes.data);

      toast.success("Nome atualizado com sucesso!");
    } catch {
      toast.error("Erro ao atualizar nome");
    } finally {
      setLoadingNome(false);
    }
  };

  const onSaveSenha = async (data: SenhaForm) => {
    try {
      setLoadingSenha(true);
      await api.put("/auth/perfil", {
        senhaAtual: data.senhaAtual,
        novaSenha: data.novaSenha
      });
      toast.success("Senha alterada com sucesso!");
      resetSenha();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Erro ao alterar senha");
    } finally {
      setLoadingSenha(false);
    }
  };

  useEffect(() => {
    if (usuario?.nome) {
      resetNome({ nome: usuario.nome });
    }
  }, [usuario?.nome, resetNome]);

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Info atual */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center">
              <User size={24} className="text-pink-400" />
            </div>
            <div>
              <p className="font-semibold text-lg">{usuario?.nome}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail size={13} />
                {usuario?.email}
              </p>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                {usuario?.role === "ADMIN" ? "Administradora" : "Funcionária"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alterar nome */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User size={16} /> Alterar Nome
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNome(onSaveNome)} className="space-y-4">
            <div className="space-y-1">
              <Label>Nome completo</Label>
              <Input placeholder="Seu nome" {...regNome("nome")} />
              {errorsNome.nome && (
                <p className="text-xs text-red-500">
                  {errorsNome.nome.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={loadingNome}>
              {loadingNome ? "Salvando..." : "Salvar nome"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Alterar senha */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock size={16} /> Alterar Senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSenha(onSaveSenha)} className="space-y-4">
            <div className="space-y-1">
              <Label>Senha atual</Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...regSenha("senhaAtual")}
              />
              {errorsSenha.senhaAtual && (
                <p className="text-xs text-red-500">
                  {errorsSenha.senhaAtual.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Nova senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...regSenha("novaSenha")}
              />
              {errorsSenha.novaSenha && (
                <p className="text-xs text-red-500">
                  {errorsSenha.novaSenha.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Confirmar nova senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...regSenha("confirmarSenha")}
              />
              {errorsSenha.confirmarSenha && (
                <p className="text-xs text-red-500">
                  {errorsSenha.confirmarSenha.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={loadingSenha}>
              {loadingSenha ? "Salvando..." : "Alterar senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
