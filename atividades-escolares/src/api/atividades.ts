import api from './axios'
import type { Atividade, Resposta } from '../types'

export const getMinhasAtividades = () =>
    api.get<Atividade[]>("/me/atividades/");

export const criarAtividade = (data: Omit<Atividade, "id" | "professor" | "professor_nome" | "turma_nome">) =>
  api.post<Atividade>("/atividades/", data);

export const getAtividadeRespostas = (id_atividade: number) =>
    api.get<Resposta[]>(`/atividades/${id_atividade}/respostas/`);