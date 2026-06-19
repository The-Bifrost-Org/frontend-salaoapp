"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Servico } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Clock, DollarSign, Camera } from "lucide-react";
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
        <div className="text-center py-16 text-muted-foreground">
          Nenhum serviço cadastrado.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Imagem */}
              <div
                className="relative h-44 bg-pink-50 cursor-pointer group"
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
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-pink-300">
                    <Camera size={32} />
                    <p className="text-xs">Adicionar foto</p>
                  </div>
                )}
                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <Camera size={22} className="mx-auto mb-1" />
                    <p className="text-xs font-medium">
                      {uploadingId === s.id ? "Enviando..." : "Alterar foto"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{s.nome}</p>
                    {s.descricao && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.descricao}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={s.ativo ? "default" : "secondary"}
                    className="flex-shrink-0"
                  >
                    {s.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={13} />
                    {s.duracaoMinutos} min
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-primary">
                    <DollarSign size={13} />
                    R$ {Number(s.preco).toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/servicos/${s.id}/editar`)}
                  >
                    <Pencil size={13} className="mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-400 hover:text-red-600 hover:border-red-300"
                    onClick={() => desativar(s.id, s.nome)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
