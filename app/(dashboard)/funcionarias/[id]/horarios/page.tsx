"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Funcionaria } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

const DIAS = [
  { label: "Dom", value: 0 },
  { label: "Seg", value: 1 },
  { label: "Ter", value: 2 },
  { label: "Qua", value: 3 },
  { label: "Qui", value: 4 },
  { label: "Sex", value: 5 },
  { label: "Sáb", value: 6 }
];

interface HorarioDia {
  ativo: boolean;
  horaInicio: string;
  horaFim: string;
  temAlmoco: boolean;
  inicioAlmoco: string;
  fimAlmoco: string;
}

export default function FuncionariaHorariosPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [funcionaria, setFuncionaria] = useState<Funcionaria | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);

  const [horarios, setHorarios] = useState<Record<number, HorarioDia>>(
    Object.fromEntries(
      DIAS.map((d) => [
        d.value,
        {
          ativo: false,
          horaInicio: "08:00",
          horaFim: "18:00",
          temAlmoco: false,
          inicioAlmoco: "12:00",
          fimAlmoco: "13:00"
        }
      ])
    )
  );

  useEffect(() => {
    Promise.all([
      api.get(`/funcionarias/${id}`),
      api.get(`/funcionarias/${id}/horarios`)
    ])
      .then(([f, h]) => {
        setFuncionaria(f.data);
        const horariosExistentes = h.data;
        if (horariosExistentes.length > 0) {
          setHorarios((prev) => {
            const novo = { ...prev };
            horariosExistentes.forEach((he: any) => {
              novo[he.diaSemana] = {
                ativo: true,
                horaInicio: he.horaInicio,
                horaFim: he.horaFim,
                temAlmoco: !!he.inicioAlmoco,
                inicioAlmoco: he.inicioAlmoco ?? "12:00",
                fimAlmoco: he.fimAlmoco ?? "13:00"
              };
            });
            return novo;
          });
        }
      })
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setCarregando(false));
  }, [id]);

  const toggleDia = (dia: number) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], ativo: !prev[dia].ativo }
    }));
  };

  const toggleAlmoco = (dia: number) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], temAlmoco: !prev[dia].temAlmoco }
    }));
  };

  const atualizarHora = (
    dia: number,
    campo: "horaInicio" | "horaFim" | "inicioAlmoco" | "fimAlmoco",
    valor: string
  ) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [campo]: valor }
    }));
  };

  const salvar = async () => {
    const horariosAtivos = Object.entries(horarios)
      .filter(([, h]) => h.ativo)
      .map(([dia, h]) => ({
        diaSemana: Number(dia),
        horaInicio: h.horaInicio,
        horaFim: h.horaFim,
        inicioAlmoco: h.temAlmoco ? h.inicioAlmoco : undefined,
        fimAlmoco: h.temAlmoco ? h.fimAlmoco : undefined
      }));

    try {
      setLoading(true);
      await api.put(`/funcionarias/${id}/horarios`, {
        horarios: horariosAtivos
      });
      toast.success("Horários atualizados com sucesso!");
      router.push("/funcionarias");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Erro ao salvar horários");
    } finally {
      setLoading(false);
    }
  };

  if (carregando)
    return <p className="text-muted-foreground text-sm">Carregando...</p>;

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Horários de Trabalho</h1>
          <p className="text-muted-foreground text-sm">
            {funcionaria?.usuario.nome}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Selecione os dias e horários de expediente:
      </p>

      <div className="space-y-3">
        {DIAS.map((dia) => {
          const h = horarios[dia.value];
          return (
            <Card
              key={dia.value}
              className={`transition-all ${h.ativo ? "border-primary" : "opacity-60"}`}
            >
              <CardContent className="py-3 space-y-2">
                <div className="flex items-center gap-3">
                  {/* Toggle dia */}
                  <button
                    type="button"
                    onClick={() => toggleDia(dia.value)}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-medium text-sm transition-colors flex-shrink-0 ${
                      h.ativo
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-gray-300 text-muted-foreground"
                    }`}
                  >
                    {h.ativo ? <Check size={16} /> : dia.label}
                  </button>

                  <span className="w-8 text-sm font-medium">{dia.label}</span>

                  {h.ativo ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={h.horaInicio}
                        onChange={(e) =>
                          atualizarHora(dia.value, "horaInicio", e.target.value)
                        }
                        className="flex-1 text-sm"
                      />
                      <span className="text-muted-foreground text-sm">até</span>
                      <Input
                        type="time"
                        value={h.horaFim}
                        onChange={(e) =>
                          atualizarHora(dia.value, "horaFim", e.target.value)
                        }
                        className="flex-1 text-sm"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Folga</span>
                  )}
                </div>

                {/* Intervalo de almoço */}
                {h.ativo && (
                  <div className="pl-14 space-y-2">
                    <button
                      type="button"
                      onClick={() => toggleAlmoco(dia.value)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        h.temAlmoco
                          ? "bg-orange-100 text-orange-700 border-orange-300"
                          : "text-muted-foreground border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      🍽️{" "}
                      {h.temAlmoco
                        ? "Com intervalo de almoço"
                        : "Adicionar intervalo de almoço"}
                    </button>

                    {h.temAlmoco && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">
                          Almoço
                        </span>
                        <Input
                          type="time"
                          value={h.inicioAlmoco}
                          onChange={(e) =>
                            atualizarHora(
                              dia.value,
                              "inicioAlmoco",
                              e.target.value
                            )
                          }
                          className="flex-1 text-sm h-8"
                        />
                        <span className="text-muted-foreground text-xs">
                          até
                        </span>
                        <Input
                          type="time"
                          value={h.fimAlmoco}
                          onChange={(e) =>
                            atualizarHora(
                              dia.value,
                              "fimAlmoco",
                              e.target.value
                            )
                          }
                          className="flex-1 text-sm h-8"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button className="flex-1" disabled={loading} onClick={salvar}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
