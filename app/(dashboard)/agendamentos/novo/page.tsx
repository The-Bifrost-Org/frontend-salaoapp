"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { Funcionaria, Servico, Cliente } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const schema = z.object({
  clienteId: z.string().min(1, "Cliente é obrigatório"),
  funcionariaId: z.string().min(1, "Funcionária é obrigatória"),
  servicoId: z.string().min(1, "Serviço é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  dataHoraInicio: z.string().min(1, "Horário é obrigatório"),
  observacao: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [funcionarias, setFuncionarias] = useState<Funcionaria[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const todosHorarios = [
    ...horariosDisponiveis.map((h) => ({ hora: h, ocupado: false })),
    ...horariosOcupados.map((h) => ({ hora: h, ocupado: true }))
  ].sort((a, b) => new Date(a.hora).getTime() - new Date(b.hora).getTime());

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      data: format(new Date(), "yyyy-MM-dd")
    }
  });

  const funcionariaId = watch("funcionariaId");
  const servicoId = watch("servicoId");
  const data = watch("data");

  useEffect(() => {
    Promise.all([
      api.get("/clientes"),
      api.get("/funcionarias"),
      api.get("/servicos")
    ])
      .then(([c, f, s]) => {
        setClientes(c.data);
        setFuncionarias(f.data);
        setServicos(s.data);
      })
      .catch(() => toast.error("Erro ao carregar dados"));
  }, []);

  // carrega horários quando funcionária, serviço e data estiverem selecionados
  useEffect(() => {
    if (!funcionariaId || !servicoId || !data) {
      setHorariosDisponiveis([]);
      setValue("dataHoraInicio", "");
      return;
    }

    setCarregandoHorarios(true);
    setValue("dataHoraInicio", "");

    api
      .get(`/publico/funcionarias/${funcionariaId}/horarios-disponiveis`, {
        params: { data, servicoId }
      })
      .then((res) => {
        setHorariosDisponiveis(res.data.disponiveis ?? []);
        setHorariosOcupados(res.data.ocupados ?? []);
      })
      .catch(() => toast.error("Erro ao carregar horários"))
      .finally(() => setCarregandoHorarios(false));
  }, [funcionariaId, servicoId, data, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await api.post("/agendamentos", {
        clienteId: data.clienteId,
        funcionariaId: data.funcionariaId,
        servicoId: data.servicoId,
        dataHoraInicio: data.dataHoraInicio,
        observacao: data.observacao
      });
      toast.success("Agendamento criado com sucesso!");
      router.push("/agendamentos");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Novo Agendamento</h1>
          <p className="text-muted-foreground text-sm">
            Agende um horário para o cliente
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Cliente</Label>
              <select
                {...register("clienteId")}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              {errors.clienteId && (
                <p className="text-xs text-red-500">
                  {errors.clienteId.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Funcionária</Label>
              <select
                {...register("funcionariaId")}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="">Selecione uma funcionária</option>
                {funcionarias.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.usuario.nome}
                  </option>
                ))}
              </select>
              {errors.funcionariaId && (
                <p className="text-xs text-red-500">
                  {errors.funcionariaId.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Serviço</Label>
              <select
                {...register("servicoId")}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="">Selecione um serviço</option>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} · {s.duracaoMinutos}min · R${" "}
                    {Number(s.preco).toFixed(2)}
                  </option>
                ))}
              </select>
              {errors.servicoId && (
                <p className="text-xs text-red-500">
                  {errors.servicoId.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Data</Label>
              <Input type="date" {...register("data")} />
              {errors.data && (
                <p className="text-xs text-red-500">{errors.data.message}</p>
              )}
            </div>

            {/* Horários disponíveis */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock size={14} />
                Horário disponível
              </Label>

              {!funcionariaId || !servicoId ? (
                <p className="text-xs text-muted-foreground">
                  Selecione a funcionária e o serviço para ver os horários.
                </p>
              ) : carregandoHorarios ? (
                <p className="text-xs text-muted-foreground">
                  Carregando horários...
                </p>
              ) : horariosDisponiveis.length === 0 ? (
                <p className="text-xs text-red-500">
                  Nenhum horário disponível nesta data.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {todosHorarios.map(({ hora, ocupado }) => {
                    const horarioFormatado = format(new Date(hora), "HH:mm");
                    const selecionado = watch("dataHoraInicio") === hora;
                    return (
                      <button
                        key={hora}
                        type="button"
                        disabled={ocupado}
                        onClick={() =>
                          !ocupado && setValue("dataHoraInicio", hora)
                        }
                        className={`py-2 px-3 rounded-md text-sm border transition-colors ${
                          ocupado
                            ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed line-through"
                            : selecionado
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-gray-100 border-gray-200"
                        }`}
                      >
                        {horarioFormatado}
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.dataHoraInicio && (
                <p className="text-xs text-red-500">
                  {errors.dataHoraInicio.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Observação (opcional)</Label>
              <Input
                placeholder="Ex: Cliente prefere franja mais curta"
                {...register("observacao")}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Salvando..." : "Agendar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
