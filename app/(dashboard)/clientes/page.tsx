"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Cliente } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    api
      .get("/clientes")
      .then((res) => setClientes(res.data))
      .catch(() => toast.error("Erro ao carregar clientes"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os clientes do salão
          </p>
        </div>
        <Button onClick={() => router.push("/clientes/novo")}>
          <Plus size={16} className="mr-2" />
          Novo Cliente
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : clientes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum cliente cadastrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{c.nome}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Desde{" "}
                  {format(new Date(c.criadoEm), "MMM 'de' yyyy", {
                    locale: ptBR
                  })}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  {c.telefone && (
                    <p className="text-sm flex items-center gap-2 text-muted-foreground">
                      <Phone size={13} />
                      {c.telefone}
                    </p>
                  )}
                  {c.email && (
                    <p className="text-sm flex items-center gap-2 text-muted-foreground">
                      <Mail size={13} />
                      {c.email}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/clientes/${c.id}/editar`)}
                >
                  <Pencil size={14} className="mr-1" />
                  Editar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
