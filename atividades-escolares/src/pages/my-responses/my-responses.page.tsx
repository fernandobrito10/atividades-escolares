import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, MessageSquare, BookOpen, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getMinhasRespostas } from "../../api/respostas";
import type { Resposta } from "../../types";

export function MyResponsesPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [respostas, setRespostas] = useState<Resposta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getMinhasRespostas()
            .then((res) => setRespostas(res.data))
            .catch(() => setError("Não foi possível carregar as respostas."))
            .finally(() => setLoading(false));
    }, []);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    function formatarData(data: string) {
        return new Date(data).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-800">Atividades Escolares</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/aluno/atividades")}
                            className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block"
                        >
                            Atividades
                        </button>
                        <span className="text-sm font-medium text-blue-600 hidden sm:block">
                            Minhas Respostas
                        </span>
                        <span className="text-sm text-gray-600 hidden sm:block">{user?.username}</span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                            Aluno
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:block">Sair</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Minhas Respostas</h1>
                    <p className="text-sm text-gray-500 mt-1">Respostas que você enviou e suas correções</p>
                </div>

                {loading && (
                    <div className="flex justify-center py-16 text-gray-400 text-sm">
                        Carregando respostas...
                    </div>
                )}

                {!loading && error && (
                    <div className="text-red-700 text-sm text-center py-8">{error}</div>
                )}

                {!loading && !error && respostas.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
                        <p className="text-sm">Você ainda não enviou nenhuma resposta.</p>
                    </div>
                )}

                {!loading && !error && respostas.length > 0 && (
                    <div className="space-y-4">
                        {respostas.map((resposta) => (
                            <div
                                key={resposta.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5 text-gray-800">
                                            <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                                            <span className="font-semibold text-sm">
                                                {resposta.atividade_titulo}
                                            </span>
                                        </div>
                                    </div>

                                    {resposta.nota !== null ? (
                                        <span className="shrink-0 flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                                            <CheckCircle className="w-3 h-3" />
                                            Nota: {resposta.nota}
                                        </span>
                                    ) : (
                                        <span className="shrink-0 flex items-center gap-1 text-xs font-medium bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-full">
                                            <Clock className="w-3 h-3" />
                                            Aguardando correção
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-3">
                                    {resposta.texto}
                                </p>

                                {resposta.feedback && (
                                    <div className="bg-blue-50 rounded-lg px-4 py-3 mb-3">
                                        <p className="text-xs font-medium text-blue-700 mb-0.5">Feedback do professor</p>
                                        <p className="text-sm text-blue-800 leading-relaxed">{resposta.feedback}</p>
                                    </div>
                                )}

                                <p className="text-xs text-gray-400">
                                    Enviado em {formatarData(resposta.created_at)}
                                    {resposta.updated_at !== resposta.created_at && (
                                        <> · Editado em {formatarData(resposta.updated_at)}</>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
