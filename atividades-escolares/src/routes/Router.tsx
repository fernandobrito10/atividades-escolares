import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LoginPage } from "../pages/login/login.page";
import { ActivitiesPage } from "../pages/activities/activities.page";
import { AdminPage } from "../pages/admin/admin.page";
import { ResponsesPage } from "../pages/responses/responses.page";
import { MyResponsesPage } from "../pages/my-responses/my-responses.page";

function RoleRoute({ children, role }: { children: React.ReactNode; role: string }) {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    if (user.role !== role) return <Navigate to="/login" />;

    return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    if (!user.is_superuser) return <Navigate to="/login" />;

    return <>{children}</>;
}

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {/* pública */}
                <Route path="/login" element={<LoginPage />} />

                {/* admin */}
                <Route
                    path="/admin/usuarios"
                    element={
                        <AdminRoute>
                            <AdminPage />
                        </AdminRoute>
                    }
                />

                {/* professor */}
                <Route
                    path="/professor/atividades"
                    element={
                        <RoleRoute role="professor">
                            <ActivitiesPage />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/professor/atividades/:id/respostas"
                    element={
                        <RoleRoute role="professor">
                            <ResponsesPage />
                        </RoleRoute>
                    }
                />

                {/* aluno */}
                <Route
                    path="/aluno/atividades"
                    element={
                        <RoleRoute role="aluno">
                            <ActivitiesPage />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/aluno/respostas"
                    element={
                        <RoleRoute role="aluno">
                            <MyResponsesPage />
                        </RoleRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}
