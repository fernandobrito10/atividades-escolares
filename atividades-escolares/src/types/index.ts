export type Role = "professor" | "aluno";

export interface Turma {
  id: number;
  nome: string;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  role: Role;
  turma: number | null;
  turma_nome: string | null;
  is_superuser: boolean;
}

export interface Atividade {
  id: number;
  titulo: string;
  descricao: string;
  turma: number;
  turma_nome: string;
  data_entrega: string;
  professor: number;
  professor_nome: string;
}

export interface Resposta {
  id: number;
  texto: string;
  nota: number | null;
  feedback: string | null;
  atividade: number;
  atividade_titulo: string;
  aluno: number;
  aluno_nome: string;
  created_at: string;
  updated_at: string;
}