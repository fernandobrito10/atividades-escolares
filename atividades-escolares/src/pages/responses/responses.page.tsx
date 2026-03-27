import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { GraduationCap, LogOut, ArrowLeft, X, MessageSquare, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getAtividadeRespostas } from "../../api/atividades";
import { corrigirResposta } from "../../api/respostas";
import type { Resposta } from "../../types";

export function ResponsesPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const tituloAtividade = (location.state as { titulo?: string } | null)?.titulo ?? "Atividade";

    const [respostas, setRespostas] = useState<Resposta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [modalResposta, setModalResposta] = useState<Resposta | null>(null);
    const [nota, setNota] = useState("");
    const [feedback, setFeedback] = useState("");
    const [corrigindo, setCorrigindo] = useState(false);
    const [corrigirError, setCorrigirError] = useState("");

    useEffect(() => {
        if (!id) return;
        getAtividadeRespostas(Number(id))
            .then((res) => setRespostas(res.data))
            .catch(() => setError("Não foi possível carregar as respostas."))
            .finally(() => setLoading(false));
    }, [id]);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    function abrirModal(resposta: Resposta) {
        setModalResposta(resposta);
        setNota(resposta.nota !== null ? String(resposta.nota) : "");
        setFeedback(resposta.feedback ?? "");
        setCorrigirError("");
    }

    function fecharModal() {
        setModalResposta(null);
        setNota("");
        setFeedback("");
        setCorrigirError("");
    }

    async function handleCorrigir() {
        if (!modalResposta) return;
        const notaNum = parseFloat(nota);

        if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
            setCorrigirError("A nota deve ser um número entre 0 e 10.");
            return;
        }

        setCorrigindo(true);
        setCorrigirError("");

        try {
            await corrigirResposta(modalResposta.id, {
                nota: notaNum,
                feedback: feedback.trim() || undefined,
            });
            setRespostas((prev) =>
                prev.map((r) =>
                    r.id === modalResposta.id
                        ? { ...r, nota: notaNum, feedback: feedback.trim() || null }
                        : r
                )
            );
            fecharModal();
        } catch {
            setCorrigirError("Não foi possível salvar a correção.");
        } finally {
            setCorrigindo(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-800">Atividades Escolares</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 hidden sm:block">{user?.username}</span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                            Professor
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
                    <button
                        onClick={() => navigate("/professor/atividades")}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para atividades
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{tituloAtividade}</h1>
                    <p className="text-sm text-gray-500 mt-1">Respostas enviadas pelos alunos</p>
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
                        <p className="text-sm">Nenhuma resposta enviada ainda.</p>
                    </div>
                )}

                {!loading && !error && respostas.length > 0 && (
                    <div className="space-y-4">
                        {respostas.map((resposta) => (
                            <div
                                key={resposta.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="font-semibold text-gray-800 text-sm">
                                                {resposta.aluno_nome || `Aluno #${resposta.aluno}`}
                                            </p>
                                            {resposta.nota !== null ? (
                                                <span className="flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Nota: {resposta.nota}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium bg-yellow-50 text-yellow-600 px-2.5 py-0.5 rounded-full">
                                                    Não corrigido
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                            {resposta.texto}
                                        </p>
                                        {resposta.feedback && (
                                            <div className="mt-3 bg-blue-50 rounded-lg px-3 py-2">
                                                <p className="text-xs font-medium text-blue-700 mb-0.5">Feedback</p>
                                                <p className="text-sm text-blue-800 leading-relaxed">{resposta.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => abrirModal(resposta)}
                                        className="shrink-0 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-sm font-medium rounded-lg px-4 py-1.5 transition-colors"
                                    >
                                        {resposta.nota !== null ? "Editar correção" : "Corrigir"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {modalResposta && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="font-bold text-gray-800 text-lg">Correção</h2>
                            <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 mb-5">
                            {modalResposta.aluno_nome || `Aluno #${modalResposta.aluno}`}
                        </p>

                        <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5">
                            <p className="text-xs font-medium text-gray-500 mb-1">Resposta do aluno</p>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {modalResposta.texto}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="pl-1 block text-sm font-medium mb-1.5 text-gray-700">
                                    Nota <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={10}
                                    step={0.5}
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                    placeholder="0 a 10"
                                    className="pl-4 w-full border border-gray-200 rounded-lg pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>

                            <div>
                                <label className="pl-1 block text-sm font-medium mb-1.5 text-gray-700">
                                    Feedback <span className="text-gray-400 font-normal">(opcional)</span>
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Deixe um comentário para o aluno..."
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                        </div>

                        {corrigirError && (
                            <p className="text-red-700 text-sm text-center mt-4">{corrigirError}</p>
                        )}

                        <button
                            onClick={handleCorrigir}
                            disabled={corrigindo || nota.trim() === ""}
                            className="mt-6 w-full bg-blue-600 hover:bg-blue-800 disabled:bg-blue-200 text-white font-medium rounded-lg py-2 text-sm transition-colors"
                        >
                            {corrigindo ? "Salvando..." : "Salvar correção"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
