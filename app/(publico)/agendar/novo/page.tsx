"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClienteStore } from "@/hooks/use-cliente-store";
import { Servico } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, ArrowRight, Clock, DollarSign } from "lucide-react";
import apiCliente from "@/lib/api-cliente";
import Image from "next/image";

interface Funcionaria {
  funcionariaId: string;
  funcionaria: {
    id: string;
    usuario: { nome: string };
  };
}

type Etapa = "servico" | "funcionaria" | "data" | "horario" | "confirmar";

export default function NovoAgendamentoClientePage() {
  const router = useRouter();
  const { token, cliente } = useClienteStore();
  const [hydrated, setHydrated] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>("servico");
  const [loading, setLoading] = useState(false);

  // dados
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [funcionarias, setFuncionarias] = useState<Funcionaria[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  // seleções
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(
    null
  );
  const [funcionariaSelecionada, setFuncionariaSelecionada] =
    useState<Funcionaria | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(
    null
  );
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !token) router.push("/agendar/login");
  }, [hydrated, token, router]);

  useEffect(() => {
    apiCliente.get("/publico/servicos").then((res) => setServicos(res.data));
  }, []);

  useEffect(() => {
    if (!servicoSelecionado) return;
    apiCliente
      .get(`/publico/servicos/${servicoSelecionado.id}/funcionarias`)
      .then((res) => setFuncionarias(res.data));
  }, [servicoSelecionado]);

  useEffect(() => {
    if (!funcionariaSelecionada || !servicoSelecionado || !dataSelecionada)
      return;
    setCarregandoHorarios(true);
    setHorarioSelecionado(null);
    apiCliente
      .get(
        `/publico/funcionarias/${funcionariaSelecionada.funcionaria.id}/horarios-disponiveis`,
        {
          params: { data: dataSelecionada, servicoId: servicoSelecionado.id }
        }
      )
      .then((res) => {
        setHorariosDisponiveis(res.data.disponiveis ?? []);
        setHorariosOcupados(res.data.ocupados ?? []);
      })
      .finally(() => setCarregandoHorarios(false));
  }, [funcionariaSelecionada, servicoSelecionado, dataSelecionada]);

  const confirmar = async () => {
    if (!servicoSelecionado || !funcionariaSelecionada || !horarioSelecionado)
      return;
    try {
      setLoading(true);
      await apiCliente.post("/publico/agendamentos", {
        funcionariaId: funcionariaSelecionada.funcionaria.id,
        servicoId: servicoSelecionado.id,
        dataHoraInicio: horarioSelecionado,
        observacao
      });
      toast.success("Agendamento realizado com sucesso!");
      router.push("/agendar/meus-agendamentos");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Erro ao agendar");
    } finally {
      setLoading(false);
    }
  };

  const todosHorarios = [
    ...horariosDisponiveis.map((h) => ({ hora: h, ocupado: false })),
    ...horariosOcupados.map((h) => ({ hora: h, ocupado: true }))
  ].sort((a, b) => new Date(a.hora).getTime() - new Date(b.hora).getTime());

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/agendar")}
        >
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-xl font-bold">Agendar Horário</h1>
      </div>

      {/* Indicador de etapas */}
      <div className="flex items-center gap-1">
        {(
          ["servico", "funcionaria", "data", "horario", "confirmar"] as Etapa[]
        ).map((e, i) => (
          <div
            key={e}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              etapa === e
                ? "bg-primary"
                : [
                      "servico",
                      "funcionaria",
                      "data",
                      "horario",
                      "confirmar"
                    ].indexOf(etapa) > i
                  ? "bg-primary/40"
                  : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Etapa 1 — Serviço */}
      {etapa === "servico" && (
        <div className="space-y-3">
          <h2 className="font-semibold">Escolha o serviço</h2>
          {servicos.map((s) => (
            <Card
              key={s.id}
              className={`cursor-pointer transition-all overflow-hidden ${servicoSelecionado?.id === s.id ? "border-primary ring-1 ring-primary" : ""}`}
              onClick={() => setServicoSelecionado(s)}
            >
              {/* Imagem do serviço */}
              {s.imagemUrl && (
                <div className="relative h-32 w-full">
                  <Image
                    src={s.imagemUrl}
                    alt={s.nome}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.nome}</p>
                  {s.descricao && (
                    <p className="text-sm text-muted-foreground">
                      {s.descricao}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} />
                      {s.duracaoMinutos} min
                    </span>
                    <span className="text-xs font-medium flex items-center gap-1">
                      <DollarSign size={12} />
                      R$ {Number(s.preco).toFixed(2)}
                    </span>
                  </div>
                </div>
                {servicoSelecionado?.id === s.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <Button
            className="w-full"
            disabled={!servicoSelecionado}
            onClick={() => setEtapa("funcionaria")}
          >
            Continuar <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      )}

      {/* Etapa 2 — Funcionária */}
      {etapa === "funcionaria" && (
        <div className="space-y-3">
          <h2 className="font-semibold">Escolha a profissional</h2>
          {funcionarias.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma profissional disponível para este serviço.
            </p>
          ) : (
            funcionarias.map((f) => (
              <Card
                key={f.funcionariaId}
                className={`cursor-pointer transition-all ${funcionariaSelecionada?.funcionariaId === f.funcionariaId ? "border-primary ring-1 ring-primary" : ""}`}
                onClick={() => setFuncionariaSelecionada(f)}
              >
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                      💇‍♀️
                    </div>
                    <p className="font-medium">{f.funcionaria.usuario.nome}</p>
                  </div>
                  {funcionariaSelecionada?.funcionariaId ===
                    f.funcionariaId && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEtapa("servico")}
            >
              Voltar
            </Button>
            <Button
              className="flex-1"
              disabled={!funcionariaSelecionada}
              onClick={() => setEtapa("data")}
            >
              Continuar <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Etapa 3 — Data */}
      {etapa === "data" && (
        <div className="space-y-4">
          <h2 className="font-semibold">Escolha a data</h2>
          <Input
            type="date"
            value={dataSelecionada}
            min={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => setDataSelecionada(e.target.value)}
            className="w-full"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEtapa("funcionaria")}
            >
              Voltar
            </Button>
            <Button className="flex-1" onClick={() => setEtapa("horario")}>
              Continuar <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Etapa 4 — Horário */}
      {etapa === "horario" && (
        <div className="space-y-4">
          <h2 className="font-semibold">
            Escolha o horário —{" "}
            <span className="text-muted-foreground font-normal text-sm">
              {format(new Date(dataSelecionada + "T12:00:00"), "dd 'de' MMMM", {
                locale: ptBR
              })}
            </span>
          </h2>

          {carregandoHorarios ? (
            <p className="text-muted-foreground text-sm">
              Carregando horários...
            </p>
          ) : todosHorarios.length === 0 ? (
            <p className="text-red-500 text-sm">
              Nenhum horário disponível nesta data.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {todosHorarios.map(({ hora, ocupado }) => {
                const selecionado = horarioSelecionado === hora;
                return (
                  <button
                    key={hora}
                    type="button"
                    disabled={ocupado}
                    onClick={() => !ocupado && setHorarioSelecionado(hora)}
                    className={`py-3 px-3 rounded-md text-sm border transition-colors ${
                      ocupado
                        ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed line-through"
                        : selecionado
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    {format(new Date(hora), "HH:mm")}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEtapa("data")}
            >
              Voltar
            </Button>
            <Button
              className="flex-1"
              disabled={!horarioSelecionado}
              onClick={() => setEtapa("confirmar")}
            >
              Continuar <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Etapa 5 — Confirmar */}
      {etapa === "confirmar" &&
        servicoSelecionado &&
        funcionariaSelecionada &&
        horarioSelecionado && (
          <div className="space-y-4">
            <h2 className="font-semibold">Confirmar agendamento</h2>

            <Card>
              <CardContent className="py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Serviço</span>
                  <span className="font-medium">{servicoSelecionado.nome}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profissional</span>
                  <span className="font-medium">
                    {funcionariaSelecionada.funcionaria.usuario.nome}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">
                    {format(
                      new Date(dataSelecionada + "T12:00:00"),
                      "dd 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horário</span>
                  <span className="font-medium">
                    {format(new Date(horarioSelecionado), "HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duração</span>
                  <span className="font-medium">
                    {servicoSelecionado.duracaoMinutos} min
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-3">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-base">
                    R$ {Number(servicoSelecionado.preco).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-1">
              <Label>Observação (opcional)</Label>
              <Input
                placeholder="Ex: Cabelo longo, prefiro franja"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEtapa("horario")}
              >
                Voltar
              </Button>
              <Button className="flex-1" disabled={loading} onClick={confirmar}>
                {loading ? "Confirmando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}
