import { useEffect, useState } from "react";
import axios from "axios";
import { ConfiguracaoSalao } from "@/types";

const cache: { data: ConfiguracaoSalao | null; timestamp: number } = {
  data: null,
  timestamp: 0
};

export function useConfiguracoes() {
  const [config, setConfig] = useState<ConfiguracaoSalao | null>(cache.data);
  const [loading, setLoading] = useState(!cache.data);

  useEffect(() => {
    if (cache.data && Date.now() - cache.timestamp < 5 * 60 * 1000) {
      setConfig(cache.data);
      setLoading(false);
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/configuracoes/publica`)
      .then((res) => {
        cache.data = res.data;
        cache.timestamp = Date.now();
        setConfig(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}
