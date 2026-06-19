"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { ConfiguracaoSalao } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Store } from "lucide-react";
import Image from "next/image";

const schema = z.object({
  nomeSalao: z.string().min(2, "Nome é obrigatório"),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfiguracaoSalao | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    api.get("/configuracoes").then((res) => {
      setConfig(res.data);
      reset({
        nomeSalao: res.data.nomeSalao,
        telefone: res.data.telefone ?? "",
        endereco: res.data.endereco ?? "",
        cidade: res.data.cidade ?? ""
      });
    });
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const res = await api.put("/configuracoes", data);
      setConfig(res.data);
      toast.success("Configurações salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // valida tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 2MB.");
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/configuracoes/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setConfig(res.data);
      toast.success("Logo atualizada com sucesso!");
    } catch {
      toast.error("Erro ao fazer upload da logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Configurações do Salão</h1>
        <p className="text-muted-foreground text-sm">
          Personalize as informações do seu salão
        </p>
      </div>

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logo do Salão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
              {config?.logoUrl ? (
                <Image
                  src={config.logoUrl}
                  alt="Logo"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Store size={32} className="text-gray-300" />
              )}
            </div>
            <div className="space-y-1">
              <Button
                variant="outline"
                size="sm"
                disabled={uploadingLogo}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} className="mr-2" />
                {uploadingLogo ? "Enviando..." : "Fazer upload"}
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG, JPG ou SVG • Máx 2MB
              </p>
              <p className="text-xs text-muted-foreground">
                Dimensão recomendada: 200x200px
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={uploadLogo}
          />
        </CardContent>
      </Card>

      {/* Informações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações do Salão</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Nome do Salão</Label>
              <Input
                placeholder="Ex: Salão da Maria"
                {...register("nomeSalao")}
              />
              {errors.nomeSalao && (
                <p className="text-xs text-red-500">
                  {errors.nomeSalao.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Telefone (opcional)</Label>
              <Input placeholder="(16) 99999-0000" {...register("telefone")} />
            </div>

            <div className="space-y-1">
              <Label>Endereço (opcional)</Label>
              <Input
                placeholder="Rua das Flores, 123"
                {...register("endereco")}
              />
            </div>

            <div className="space-y-1">
              <Label>Cidade (opcional)</Label>
              <Input placeholder="São Paulo - SP" {...register("cidade")} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
