"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Servico } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  DollarSign,
  Upload,
  ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ServicosPage() {
  const router = useRouter();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [servicoAtivo, setServicoAtivo] = useState<string | null>(null);

  const carregar = () => {
    api
      .get("/servicos")
      .then((res) => setServicos(res.data))
      .catch(() => toast.error("Erro ao carregar serviços"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, []);

  const desativar = async (id: string, nome: string) => {
    if (!confirm(`Desativar serviço "${nome}"?`)) return;
    try {
      await api.delete(`/servicos/${id}`);
      toast.success("Serviço desativado");
      carregar();
    } catch {
      toast.error("Erro ao desativar serviço");
    }
  };

  const uploadImagem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !servicoAtivo) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    try {
      setUploadingId(servicoAtivo);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(`/servicos/${servicoAtivo}/imagem`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setServicos((prev) =>
        prev.map((s) =>
          s.id === servicoAtivo ? { ...s, imagemUrl: res.data.imagemUrl } : s
        )
      );
      toast.success("Imagem adicionada!");
    } catch {
      toast.error("Erro ao fazer upload");
    } finally {
      setUploadingId(null);
      setServicoAtivo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Serviços</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os serviços oferecidos
          </p>
        </div>
        <Button onClick={() => router.push("/servicos/novo")}>
          <Plus size={16} className="mr-2" />
          Novo Serviço
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={uploadImagem}
      />

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : servicos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum serviço cadastrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((s) => (
            <Card key={s.id}>
              {/* Imagem do serviço */}
              <div
                className="relative h-40 bg-gray-100 rounded-t-lg overflow-hidden cursor-pointer group"
                onClick={() => {
                  setServicoAtivo(s.id);
                  fileInputRef.current?.click();
                }}
              >
                {s.imagemUrl ? (
                  <Image
                    src={s.imagemUrl}
                    alt={s.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon size={32} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <Upload size={20} className="mx-auto mb-1" />
                    <p className="text-xs">
                      {uploadingId === s.id ? "Enviando..." : "Alterar foto"}
                    </p>
                  </div>
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{s.nome}</CardTitle>
                  <Badge variant={s.ativo ? "default" : "secondary"}>
                    {s.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {s.descricao && (
                  <p className="text-sm text-muted-foreground">{s.descricao}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock size={14} />
                    {s.duracaoMinutos} min
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <DollarSign size={14} />
                    R$ {Number(s.preco).toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/servicos/${s.id}/editar`)}
                  >
                    <Pencil size={14} className="mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => desativar(s.id, s.nome)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
