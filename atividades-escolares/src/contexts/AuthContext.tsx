import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react"; 
import api from "../api/axios";
import type { Usuario, Role } from "../types";

interface AuthContextType {
  user: Usuario | null;
  login: (email: string, password: string) => Promise<Role>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/me/").then((response) => {
        setUser(response.data);
      }).catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
      });
    }
  }, []);

  async function login(email: string, password: string): Promise<Role> {
    const response = await api.post("/auth/login/", { email, password });
    const { access, refresh, user } = response.data;

    localStorage.setItem("token", access);
    localStorage.setItem("refresh", refresh);
    setUser(user);

    return user.role;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    localStorage.removeItem("refresh");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);