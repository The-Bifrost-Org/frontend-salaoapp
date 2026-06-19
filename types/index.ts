export type Role = "ADMIN" | "FUNCIONARIA";

export type StatusAgendamento =
  | "AGENDADO"
  | "CONFIRMADO"
  | "CONCLUIDO"
  | "CANCELADO";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
}

export interface Funcionaria {
  id: string;
  usuarioId: string;
  telefone?: string;
  fotoPerfil?: string;
  ativo: boolean;
  criadoEm: string;
  usuario: Usuario;
}

export interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  duracaoMinutos: number;
  preco: string;
  imagemUrl?: string;
  ativo: boolean;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  criadoEm: string;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  funcionariaId: string;
  servicoId: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: StatusAgendamento;
  observacao?: string;
  cliente: Cliente;
  funcionaria: Funcionaria;
  servico: Servico;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ConfiguracaoSalao {
  id: string;
  nomeSalao: string;
  logoUrl?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
}

export interface ImagemGaleria {
  id: string;
  url: string;
  titulo?: string;
  categoria: string;
  criadoEm: string;
}