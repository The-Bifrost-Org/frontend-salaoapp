import { useEffect } from "react";
import { useAuthStore } from "./use-auth-store";
import api from "@/lib/api";

export function useAuthInit() {
  const { token, setAuth, logout } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    api
      .get("/auth/me")
      .then((res) => {
        setAuth(token, res.data);
      })
      .catch(() => {
        logout();
      });
  }, [token]);
}
