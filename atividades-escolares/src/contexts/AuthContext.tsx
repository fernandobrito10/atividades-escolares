import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react"; 
import api from "../api/axios";
import type { Usuario } from "../types";

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/me/")
        .then((response) => setUser(response.data))
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string): Promise<Usuario> {
    const response = await api.post("/auth/login/", { email, password });
    const { access, refresh, user } = response.data;

    localStorage.setItem("token", access);
    localStorage.setItem("refresh", refresh);
    setUser(user);

    return user;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    localStorage.removeItem("refresh");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);