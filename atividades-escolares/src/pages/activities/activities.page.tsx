import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, Calendar, BookOpen, Plus, ChevronRight, X, Clock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getMinhasAtividades, criarAtividade, getTurmas } from "../../api/atividades";
import { enviarResposta, getMinhasRespostas, editarResposta } from "../../api/respostas";
import type { Atividade, Turma, Resposta } from "../../types";

export function ActivitiesPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [atividades, setAtividades] = useState<Atividade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [respostas, setRespostas] = useState<Resposta[]>([]);

    const [modalEnviar, setModalEnviar] = useState<Atividade | null>(null);
    const [respostaTexto, setRespostaTexto] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [enviarError, setEnviarError] = useState("");

    const [modalVer, setModalVer] = useState<{ atividade: Atividade; resposta: Resposta } | null>(null);
    const [textoEditado, setTextoEditado] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [salvarError, setSalvarError] = useState("");

    const [modalCriar, setModalCriar] = useState(false);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [turmaId, setTurmaId] = useState("");
    const [dataEntrega, setDataEntrega] = useState("");
    const [criando, setCriando] = useState(false);
    const [criarError, setCriarError] = useState("");

    const isProfessor = user?.role === "professor";

    useEffect(() => {
        if (isProfessor) {
            getMinhasAtividades()
                .then((res) => setAtividades(res.data))
                .catch(() => setError("Não foi possível carregar as atividades."))
                .finally(() => setLoading(false));
        } else {
            Promise.all([getMinhasAtividades(), getMinhasRespostas()])
                .then(([atividadesRes, respostasRes]) => {
                    setAtividades(atividadesRes.data);
                    setRespostas(respostasRes.data);
                })
                .catch(() => setError("Não foi possível carregar as atividades."))
                .finally(() => setLoading(false));
        }
    }, [isProfessor]);

    function respostaDaAtividade(atividadeId: number): Resposta | undefined {
        return respostas.find((r) => r.atividade === atividadeId);
    }

    function prazoAtivo(dataEntregaStr: string): boolean {
        return new Date(dataEntregaStr) > new Date();
    }

    function formatarData(data: string) {
        return new Date(data).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    function abrirModalCriar() {
        setTitulo("");
        setDescricao("");
        setTurmaId("");
        setDataEntrega("");
        setCriarError("");
        setModalCriar(true);
        getTurmas().then((res) => setTurmas(res.data));
    }

    function fecharModalCriar() {
        setModalCriar(false);
    }

    async function handleCriarAtividade() {
        setCriando(true);
        setCriarError("");
        try {
            const nova = await criarAtividade({
                titulo,
                descricao,
                turma: Number(turmaId),
                data_entrega: new Date(dataEntrega).toISOString(),
            });
            setAtividades((prev) => [...prev, nova.data]);
            fecharModalCriar();
        } catch {
            setCriarError("Não foi possível criar a atividade. Verifique os campos.");
        } finally {
            setCriando(false);
        }
    }

    function abrirModalEnviar(atividade: Atividade) {
        setModalEnviar(atividade);
        setRespostaTexto("");
        setEnviarError("");
    }

    function fecharModalEnviar() {
        setModalEnviar(null);
        setRespostaTexto("");
        setEnviarError("");
    }

    async function handleEnviarResposta() {
        if (!modalEnviar) return;
        setEnviando(true);
        setEnviarError("");
        try {
            const res = await enviarResposta({ texto: respostaTexto, atividade: modalEnviar.id });
            setRespostas((prev) => [...prev, res.data]);
            fecharModalEnviar();
        } catch {
            setEnviarError("Não foi possível enviar a resposta. Verifique se o prazo encerrou.");
        } finally {
            setEnviando(false);
        }
    }

    function abrirModalVer(atividade: Atividade, resposta: Resposta) {
        setModalVer({ atividade, resposta });
        setTextoEditado(resposta.texto);
        setSalvarError("");
    }

    function fecharModalVer() {
        setModalVer(null);
        setTextoEditado("");
        setSalvarError("");
    }

    async function handleSalvarEdicao() {
        if (!modalVer) return;
        setSalvando(true);
        setSalvarError("");
        try {
            await editarResposta(textoEditado, modalVer.resposta.id);
            setRespostas((prev) =>
                prev.map((r) => (r.id === modalVer.resposta.id ? { ...r, texto: textoEditado } : r))
            );
            fecharModalVer();
        } catch {
            setSalvarError("Não foi possível salvar a alteração.");
        } finally {
            setSalvando(false);
        }
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
                        {!isProfessor && (
                            <div className="flex">
                                <button
                                    onClick={() => navigate("/aluno/respostas")}
                                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block mr-2"
                                >
                                    Minhas Respostas
                                </button>
                                <button
                                    className={atividades ? "text-sm hover:text-blue-600 text-blue-500" : "text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block" }
                                >
                                    Atividades
                                </button>
                            </div>

                        )}
                        <span className="text-sm text-gray-600 hidden sm:block">{user?.username}</span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isProfessor ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                            {isProfessor ? "Professor" : "Aluno"}
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
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isProfessor ? "Minhas Atividades" : "Atividades"}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isProfessor
                                ? "Gerencie as atividades que você criou"
                                : "Atividades disponíveis para sua turma"}
                        </p>
                    </div>

                    {isProfessor && (
                        <button
                            onClick={abrirModalCriar}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-800 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Atividade
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="flex justify-center py-16 text-gray-400 text-sm">
                        Carregando atividades...
                    </div>
                )}

                {!loading && error && (
                    <div className="text-red-700 text-sm text-center py-8">{error}</div>
                )}

                {!loading && !error && atividades.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <BookOpen className="w-10 h-10 mb-3 opacity-40" />
                        <p className="text-sm">Nenhuma atividade encontrada.</p>
                    </div>
                )}

                {!loading && !error && atividades.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {atividades.map((atividade) => {
                            if (isProfessor) {
                                return (
                                    <div
                                        key={atividade.id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4"
                                    >
                                        <div className="flex-1">
                                            <h2 className="font-semibold text-gray-800 text-base leading-snug mb-1">
                                                {atividade.titulo}
                                            </h2>
                                            <span className="inline-block text-xs font-medium bg-blue-50 text-blue-600 rounded-full px-2.5 py-0.5">
                                                {atividade.turma_nome}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Entrega: {formatarData(atividade.data_entrega)}
                                        </div>
                                        <button
                                            onClick={() =>
                                                navigate(`/professor/atividades/${atividade.id}/respostas`, {
                                                    state: { titulo: atividade.titulo },
                                                })
                                            }
                                            className="flex items-center justify-center gap-1.5 w-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-lg py-2 text-sm transition-colors"
                                        >
                                            Ver respostas
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            }

                            const respostaExistente = respostaDaAtividade(atividade.id);

                            return (
                                <div
                                    key={atividade.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4"
                                >
                                    <div className="flex-1">
                                        <h2 className="font-semibold text-gray-800 text-base leading-snug mb-2">
                                            {atividade.titulo}
                                        </h2>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {atividade.descricao}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Entrega: {formatarData(atividade.data_entrega)}
                                        </div>
                                        {respostaExistente?.nota !== null && respostaExistente?.nota !== undefined && (
                                            <span className="text-xs font-medium bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full">
                                                Nota: {respostaExistente.nota}
                                            </span>
                                        )}
                                    </div>
                                    {respostaExistente ? (
                                        <button
                                            onClick={() => abrirModalVer(atividade, respostaExistente)}
                                            className="w-full border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 font-medium rounded-lg py-2 text-sm transition-colors"
                                        >
                                            Ver resposta
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => abrirModalEnviar(atividade)}
                                            className="w-full bg-blue-600 hover:bg-blue-800 text-white font-medium rounded-lg py-2 text-sm transition-colors"
                                        >
                                            Enviar resposta
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {modalCriar && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-gray-800 text-lg">Nova Atividade</h2>
                            <button onClick={fecharModalCriar} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="pl-1 block text-sm font-medium mb-1.5 text-gray-700">Título</label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Título da atividade"
                                    className="pl-4 w-full border border-gray-200 rounded-lg pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            <div>
                                <label className="pl-1 block text-sm font-medium mb-1.5 text-gray-700">Descrição</label>
                                <textarea
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    placeholder="Descreva a atividade..."
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            <div>
                                <label className="pl-1 block text-sm font-medium mb-1.5 text-gray-700">Turma</label>
                                <select
                                    value={turmaId}
                                    onChange={(e) => setTurmaId(e.target.value)}
                                    className="pl-4 w-full border border-gray-200 rounded-lg pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                                >
                                    <option value="">Selecione uma turma</option>
                                    {turmas.map((t) => (
                                        <option key={t.id} value={t.id}>{t.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="pl-1 block text-sm font-medium mb-1.5 text-gray-700">Data de entrega</label>
                                <input
                                    type="datetime-local"
                                    value={dataEntrega}
                                    onChange={(e) => setDataEntrega(e.target.value)}
                                    className="pl-4 w-full border border-gray-200 rounded-lg pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                        </div>

                        {criarError && (
                            <p className="text-red-700 text-sm text-center mt-4">{criarError}</p>
                        )}

                        <button
                            onClick={handleCriarAtividade}
                            disabled={criando || !titulo.trim() || !descricao.trim() || !turmaId || !dataEntrega}
                            className="mt-6 w-full bg-blue-600 hover:bg-blue-800 disabled:bg-blue-200 text-white font-medium rounded-lg py-2 text-sm transition-colors"
                        >
                            {criando ? "Criando..." : "Criar atividade"}
                        </button>
                    </div>
                </div>
            )}

            {modalEnviar && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="font-bold text-gray-800 text-base">{modalEnviar.titulo}</h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Entrega: {formatarData(modalEnviar.data_entrega)}
                                </p>
                            </div>
                            <button onClick={fecharModalEnviar} className="text-gray-400 hover:text-gray-600 ml-4">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="pl-1 block text-sm font-medium mb-1.5 text-gray-700">
                                Sua resposta
                            </label>
                            <textarea
                                value={respostaTexto}
                                onChange={(e) => setRespostaTexto(e.target.value)}
                                placeholder="Digite sua resposta aqui..."
                                rows={5}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>

                        {enviarError && (
                            <p className="text-red-700 text-sm text-center mb-3">{enviarError}</p>
                        )}

                        <button
                            onClick={handleEnviarResposta}
                            disabled={enviando || respostaTexto.trim() === ""}
                            className="w-full bg-blue-600 hover:bg-blue-800 disabled:bg-blue-200 text-white font-medium rounded-lg py-2 text-sm transition-colors"
                        >
                            {enviando ? "Enviando..." : "Enviar"}
                        </button>
                    </div>
                </div>
            )}

            {modalVer && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="font-bold text-gray-800 text-base">{modalVer.atividade.titulo}</h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Entrega: {formatarData(modalVer.atividade.data_entrega)}
                                </p>
                            </div>
                            <button onClick={fecharModalVer} className="text-gray-400 hover:text-gray-600 ml-4">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {!prazoAtivo(modalVer.atividade.data_entrega) && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg px-3 py-2 mb-4">
                                <Clock className="w-3.5 h-3.5" />
                                Prazo encerrado
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="pl-1 block text-sm font-medium mb-1.5 text-gray-700">
                                Sua resposta
                            </label>
                            <textarea
                                value={textoEditado}
                                onChange={(e) => setTextoEditado(e.target.value)}
                                rows={5}
                                readOnly={!prazoAtivo(modalVer.atividade.data_entrega)}
                                className={`w-full border rounded-lg px-4 py-2 text-sm resize-none focus:outline-none ${prazoAtivo(modalVer.atividade.data_entrega)
                                        ? "border-gray-200 focus:ring-2 focus:ring-blue-300"
                                        : "border-gray-100 bg-gray-50 text-gray-500 cursor-default"
                                    }`}
                            />
                        </div>

                        {modalVer.resposta.nota !== null && (
                            <div className="bg-green-50 rounded-lg px-4 py-3 mb-4 space-y-1">
                                <p className="text-xs font-medium text-green-700">
                                    Nota: {modalVer.resposta.nota}
                                </p>
                                {modalVer.resposta.feedback && (
                                    <p className="text-sm text-green-800 leading-relaxed">
                                        {modalVer.resposta.feedback}
                                    </p>
                                )}
                            </div>
                        )}

                        {salvarError && (
                            <p className="text-red-700 text-sm text-center mb-3">{salvarError}</p>
                        )}

                        {prazoAtivo(modalVer.atividade.data_entrega) && (
                            <button
                                onClick={handleSalvarEdicao}
                                disabled={salvando || textoEditado.trim() === "" || textoEditado === modalVer.resposta.texto}
                                className="w-full bg-blue-600 hover:bg-blue-800 disabled:bg-blue-200 text-white font-medium rounded-lg py-2 text-sm transition-colors"
                            >
                                {salvando ? "Salvando..." : "Salvar alterações"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
