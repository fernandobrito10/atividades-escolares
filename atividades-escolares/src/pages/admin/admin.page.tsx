import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, Plus, X, Users, ShieldCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getUsuarios, criarUsuario } from "../../api/usuarios";
import { getTurmas } from "../../api/atividades";
import type { Usuario, Turma, Role } from "../../types";

export function AdminPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [modal, setModal] = useState(false);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Role>("aluno");
    const [turmaId, setTurmaId] = useState("");
    const [criando, setCriando] = useState(false);
    const [criarError, setCriarError] = useState("");

    useEffect(() => {
        getUsuarios()
            .then((res) => setUsuarios(res.data))
            .catch(() => setError("Não foi possível carregar os usuários."))
            .finally(() => setLoading(false));
    }, []);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    function abrirModal() {
        setUsername("");
        setEmail("");
        setPassword("");
        setRole("aluno");
        setTurmaId("");
        setCriarError("");
        setModal(true);
        getTurmas().then((res) => setTurmas(res.data));
    }

    function fecharModal() {
        setModal(false);
    }

    async function handleCriar() {
        setCriando(true);
        setCriarError("");

        try {
            const novo = await criarUsuario({
                username,
                email,
                password,
                role,
                turma: role === "aluno" ? Number(turmaId) : null,
            });
            setUsuarios((prev) => [...prev, novo.data]);
            fecharModal();
        } catch (err: unknown) {
            const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
            const primeiro = data && Object.values(data).flat()[0];
            setCriarError(primeiro ?? "Não foi possível criar o usuário.");
        } finally {
            setCriando(false);
        }
    }

    const professores = usuarios.filter((u) => u.role === "professor" && !u.is_superuser);
    const alunos = usuarios.filter((u) => u.role === "aluno");

    const podeCriar =
        username.trim() !== "" &&
        email.trim() !== "" &&
        password.trim() !== "" &&
        (role === "professor" || (role === "aluno" && turmaId !== ""));

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-800">Atividades Escolares</span>
                        <span className="ml-1 flex items-center gap-1 text-xs font-medium bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            Admin
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:block">Sair</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h1>
                        <p className="text-sm text-gray-500 mt-1">Cadastre professores e alunos na plataforma</p>
                    </div>
                    <button
                        onClick={abrirModal}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-800 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Usuário
                    </button>
                </div>

                {loading && (
                    <div className="flex justify-center py-16 text-gray-400 text-sm">
                        Carregando usuários...
                    </div>
                )}

                {!loading && error && (
                    <div className="text-red-700 text-sm text-center py-8">{error}</div>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-blue-600" />
                                <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                    Professores ({professores.length})
                                </h2>
                            </div>
                            {professores.length === 0 ? (
                                <p className="text-sm text-gray-400 py-4">Nenhum professor cadastrado.</p>
                            ) : (
                                <div className="space-y-2">
                                    {professores.map((u) => (
                                        <div
                                            key={u.id}
                                            className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{u.username}</p>
                                                <p className="text-xs text-gray-400">{u.email}</p>
                                            </div>
                                            <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
                                                Professor
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-green-600" />
                                <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                    Alunos ({alunos.length})
                                </h2>
                            </div>
                            {alunos.length === 0 ? (
                                <p className="text-sm text-gray-400 py-4">Nenhum aluno cadastrado.</p>
                            ) : (
                                <div className="space-y-2">
                                    {alunos.map((u) => (
                                        <div
                                            key={u.id}
                                            className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{u.username}</p>
                                                <p className="text-xs text-gray-400">{u.email}</p>
                                            </div>
                                            <span className="text-xs font-medium bg-green-50 text-green-600 px-2.5 py-0.5 rounded-full">
                                                {u.turma_nome ?? "Sem turma"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </main>

            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-gray-800 text-lg">Novo Usuário</h2>
                            <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="pl-1 block text-sm font-medium mb-1.5 text-gray-700">Perfil</label>
                                <div className="flex gap-3">
                                    {(["professor", "aluno"] as Role[]).map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => { setRole(r); setTurmaId(""); }}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                                role === r
                                                    ? "bg-blue-600 border-blue-600 text-white"
                                                    : "border-gray-200 text-gray-500 hover:border-blue-300"
                                            }`}
                                        >
                                            {r === "professor" ? "Professor" : "Aluno"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="pl-1 block text-sm font-medium mb-1.5 text-gray-700">Usuário</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="nome.sobrenome"
                                    className="pl-4 w-full border border-gray-200 rounded-lg pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>

                            <div>
                                <label className="pl-1 block text-sm font-medium mb-1.5 text-gray-700">E-mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemplo@email.com"
                                    className="pl-4 w-full border border-gray-200 rounded-lg pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>

                            <div>
                                <label className="pl-1 block text-sm font-medium mb-1.5 text-gray-700">Senha</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="pl-4 w-full border border-gray-200 rounded-lg pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>

                            {role === "aluno" && (
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
                            )}
                        </div>

                        {criarError && (
                            <p className="text-red-700 text-sm text-center mt-4">{criarError}</p>
                        )}

                        <button
                            onClick={handleCriar}
                            disabled={criando || !podeCriar}
                            className="mt-6 w-full bg-blue-600 hover:bg-blue-800 disabled:bg-blue-200 text-white font-medium rounded-lg py-2 text-sm transition-colors"
                        >
                            {criando ? "Cadastrando..." : "Cadastrar"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
