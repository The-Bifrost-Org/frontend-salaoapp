import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ClienteAuth {
  id: string;
  nome: string;
  email: string;
}

interface ClienteAuthState {
  token: string | null;
  cliente: ClienteAuth | null;
  setAuth: (token: string, cliente: ClienteAuth) => void;
  logout: () => void;
}

export const useClienteStore = create<ClienteAuthState>()(
  persist(
    (set) => ({
      token: null,
      cliente: null,

      setAuth: (token, cliente) => {
        localStorage.setItem("cliente-token", token);
        set({ token, cliente });
      },

      logout: () => {
        localStorage.removeItem("cliente-token");
        set({ token: null, cliente: null });
      }
    }),
    {
      name: "cliente-auth-storage"
    }
  )
);
