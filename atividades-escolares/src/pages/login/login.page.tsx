import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState, type FormEvent } from "react";
import { GraduationCap } from "lucide-react";

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true)
        setError("")

        try {
            const role = await login(email, password);

            if (role === "professor") {
                navigate("/professor/atividades");
            } else {
                navigate("/aluno/atividades");
            }
        } catch {
            setError("E-mail ou senha inválidos.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-blue-500 to-blue-800 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl p-10 shadow-lg">

                <div className="mb-6 flex justify-center">
                    <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
                        <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <p className="ml-2 text-lg font-bold">Atividades<br/>Escolares</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 ">
                    <div>
                        <label className="pl-4 block text-sm font-medium mb-1.5">E-mail</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemplo@email.com"
                                className="pl-4 w-full border border-gray-200 rounded-lg pr-4 py-2"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="pl-4 block text-sm font-medium mb-1.5">Senha</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Digite sua senha"
                                className="pl-4 w-full border border-gray-200 rounded-lg pr-4 py-2"
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-800 disabled:bg-blue-200 text-white font-medium rounded-lg py-2">{loading ? "Entrando..." : "Entrar"}</button>
                    {error && (
                        <div className="text-red-700 rounded-lg text-center py-2.5 text-sm justify-center">
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}