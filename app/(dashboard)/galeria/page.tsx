"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { ImagemGaleria, Servico } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Trash2, Images, Camera } from "lucide-react";
import Image from "next/image";

const CATEGORIAS = [
  { value: "geral", label: "Geral" },
  { value: "servico", label: "Serviço" },
  { value: "antes_depois", label: "Antes e Depois" }
];

type Aba = "galeria" | "servicos";

export default function GaleriaPage() {
  const [aba, setAba] = useState<Aba>("galeria");
  const [imagens, setImagens] = useState<ImagemGaleria[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingServicoId, setUploadingServicoId] = useState<string | null>(
    null
  );
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("geral");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const servicoFileInputRef = useRef<HTMLInputElement>(null);
  const [servicoAtivo, setServicoAtivo] = useState<string | null>(null);

  const carregarGaleria = (cat?: string) => {
    setLoading(true);
    api
      .get(`/galeria${cat ? `?categoria=${cat}` : ""}`)
      .then((res) => setImagens(res.data))
      .catch(() => toast.error("Erro ao carregar galeria"))
      .finally(() => setLoading(false));
  };

  const carregarServicos = () => {
    setLoading(true);
    api
      .get("/servicos")
      .then((res) => setServicos(res.data))
      .catch(() => toast.error("Erro ao carregar serviços"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (aba === "galeria") carregarGaleria();
    else carregarServicos();
  }, [aba]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      if (titulo) formData.append("titulo", titulo);
      formData.append("categoria", categoria);

      await api.post("/galeria/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Imagem adicionada à galeria!");
      setTitulo("");
      carregarGaleria(categoriaSelecionada || undefined);
    } catch {
      toast.error("Erro ao fazer upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const uploadServicoImagem = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !servicoAtivo) return;

    try {
      setUploadingServicoId(servicoAtivo);
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
      toast.success("Imagem atualizada!");
    } catch {
      toast.error("Erro ao fazer upload");
    } finally {
      setUploadingServicoId(null);
      setServicoAtivo(null);
      if (servicoFileInputRef.current) servicoFileInputRef.current.value = "";
    }
  };

  const removerImagemServico = async (id: string) => {
    if (!confirm("Remover imagem deste serviço?")) return;
    try {
      await api.put(`/servicos/${id}`, { imagemUrl: null });
      setServicos((prev) =>
        prev.map((s) => (s.id === id ? { ...s, imagemUrl: undefined } : s))
      );
      toast.success("Imagem removida");
    } catch {
      toast.error("Erro ao remover imagem");
    }
  };

  const remover = async (id: string) => {
    if (!confirm("Remover esta imagem da galeria?")) return;
    try {
      await api.delete(`/galeria/${id}`);
      toast.success("Imagem removida");
      setImagens((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error("Erro ao remover imagem");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Galeria</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie as imagens do salão
        </p>
      </div>

      {/* Abas */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setAba("galeria")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            aba === "galeria"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          📸 Galeria do Salão
        </button>
        <button
          onClick={() => setAba("servicos")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            aba === "servicos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          ✂️ Fotos dos Serviços
        </button>
      </div>

      {/* ABA GALERIA */}
      {aba === "galeria" && (
        <div className="space-y-6">
          {/* Upload */}
          <div className="bg-white rounded-2xl border p-5 space-y-4">
            <h2 className="font-semibold">Adicionar imagem</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Título (opcional)</Label>
                <Input
                  placeholder="Ex: Corte degradê"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Categoria</Label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} className="mr-2" />
              {uploading ? "Enviando..." : "Selecionar imagem"}
            </Button>
            <p className="text-xs text-muted-foreground">
              PNG, JPG • Máx 5MB • 800x600px recomendado
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={upload}
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={categoriaSelecionada === "" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCategoriaSelecionada("");
                carregarGaleria();
              }}
            >
              Todas
            </Button>
            {CATEGORIAS.map((c) => (
              <Button
                key={c.value}
                variant={
                  categoriaSelecionada === c.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => {
                  setCategoriaSelecionada(c.value);
                  carregarGaleria(c.value);
                }}
              >
                {c.label}
              </Button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : imagens.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Images size={48} className="mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma imagem na galeria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagens.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-xl overflow-hidden border bg-white shadow-sm"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={img.url}
                      alt={img.titulo ?? "Imagem"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {img.titulo && (
                    <div className="p-2 text-xs font-medium truncate">
                      {img.titulo}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="w-7 h-7"
                      onClick={() => remover(img.id)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
                      {CATEGORIAS.find((c) => c.value === img.categoria)?.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA SERVIÇOS */}
      {aba === "servicos" && (
        <div className="space-y-4">
          <input
            ref={servicoFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={uploadServicoImagem}
          />
          <p className="text-sm text-muted-foreground">
            Clique na imagem de um serviço para alterar a foto.
          </p>
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {servicos.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                >
                  {/* Imagem clicável */}
                  <div
                    className="relative h-44 bg-pink-50 cursor-pointer group"
                    onClick={() => {
                      setServicoAtivo(s.id);
                      servicoFileInputRef.current?.click();
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
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-center">
                        <Camera size={22} className="mx-auto mb-1" />
                        <p className="text-xs font-medium">
                          {uploadingServicoId === s.id
                            ? "Enviando..."
                            : "Alterar foto"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{s.nome}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.duracaoMinutos} min • R$ {Number(s.preco).toFixed(2)}
                      </p>
                    </div>
                    {s.imagemUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600"
                        onClick={() => removerImagemServico(s.id)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
