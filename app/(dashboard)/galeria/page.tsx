"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { ImagemGaleria } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Trash2, Images } from "lucide-react";
import Image from "next/image";

const CATEGORIAS = [
  { value: "geral", label: "Geral" },
  { value: "servico", label: "Serviço" },
  { value: "antes_depois", label: "Antes e Depois" }
];

export default function GaleriaPage() {
  const [imagens, setImagens] = useState<ImagemGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("geral");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const carregar = (cat?: string) => {
    setLoading(true);
    api
      .get(`/galeria${cat ? `?categoria=${cat}` : ""}`)
      .then((res) => setImagens(res.data))
      .catch(() => toast.error("Erro ao carregar galeria"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, []);

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
      carregar(categoriaSelecionada || undefined);
    } catch {
      toast.error("Erro ao fazer upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

      {/* Upload */}
      <Card>
        <CardContent className="pt-6 space-y-4">
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
            PNG, JPG • Máx 5MB • Dimensão recomendada: 800x600px
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={upload}
          />
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={categoriaSelecionada === "" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setCategoriaSelecionada("");
            carregar();
          }}
        >
          Todas
        </Button>
        {CATEGORIAS.map((c) => (
          <Button
            key={c.value}
            variant={categoriaSelecionada === c.value ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCategoriaSelecionada(c.value);
              carregar(c.value);
            }}
          >
            {c.label}
          </Button>
        ))}
      </div>

      {/* Grid de imagens */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : imagens.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Images size={48} className="mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma imagem na galeria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {imagens.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-lg overflow-hidden border"
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
  );
}
