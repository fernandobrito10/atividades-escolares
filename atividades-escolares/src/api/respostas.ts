import type { Resposta } from "../types"
import api from "./axios"

export const getMinhasRespostas = () =>
    api.get<Resposta[]>("/me/respostas/")

export const enviarResposta = (data: { texto: string, atividade: number }) =>
    api.post<Resposta>("/respostas/", data)

export const editarResposta = (texto: string, id_atividade: number) =>
    api.patch<Resposta>(`/respostas/${id_atividade}/`, { texto })

export const corrigirResposta = (id_atividade: number, data: { feedback?: string, nota: number }) =>
    api.patch<Resposta>(`/respostas/${id_atividade}/`, data)