import { useEffect, useState } from "react";
import { useFetchClient } from "@strapi/strapi/admin";
import pluginId from "../pluginId";

interface Locale {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
}

export const useLocales = () => {
  const [locales, setLocales] = useState<Locale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { get } = useFetchClient();

  const fetchLocales = async () => {
    try {
      setIsLoading(true);
      const { data } = await get(`/${pluginId}/locales`);
      setLocales(data.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocales();
  }, [get]);

  return { locales, isLoading, error, refetch: fetchLocales };
};
