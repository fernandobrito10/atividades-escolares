import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LoginPage } from "../pages/login/login.page";

function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    return user ? <>{children}</> : <Navigate to="/login/"/>;
}

function RoleRoute({children, role}: { children: React.ReactNode; role: string }) {
    const { user } = useAuth();

    if (!user)
        return <Navigate to="/login"/>
    if (user.role !== role)
        return <Navigate to="/login"/>

    return <>{children}</>
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* professor */}
        <Route
          path="/professor/atividades"
          element={
            <RoleRoute role="professor">
              <h1>Atividades</h1>
            </RoleRoute>
          }
        />
        <Route
          path="/professor/atividades/criar"
          element={
            <RoleRoute role="professor">
              <h1>Criar atividades</h1>
            </RoleRoute>
          }
        />
        <Route
          path="/professor/atividades/:id/respostas"
          element={
            <RoleRoute role="professor">
              <h1>Corrigir respostas</h1>
            </RoleRoute>
          }
        />

        <Route
          path="/aluno/atividades"
          element={
            <RoleRoute role="aluno">
              <h1>Atividade dos alunos</h1>
            </RoleRoute>
          }
        />
        <Route
          path="/aluno/respostas"
          element={
            <RoleRoute role="aluno">
              <h1>Respostas</h1>
            </RoleRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}