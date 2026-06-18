import axios from "axios";

const apiCliente = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

apiCliente.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cliente-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiCliente.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("cliente-token");
        window.location.href = "/agendar/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiCliente;
