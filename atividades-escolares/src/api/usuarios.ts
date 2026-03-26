import api from "./axios";
import type { Usuario, Role } from "../types";

export interface CriarUsuarioPayload {
    username: string;
    email: string;
    password: string;
    role: Role;
    turma: number | null;
}

export const getUsuarios = () =>
    api.get<Usuario[]>("/gerenciar/usuarios/");

export const criarUsuario = (data: CriarUsuarioPayload) =>
    api.post<Usuario>("/gerenciar/usuarios/", data);
