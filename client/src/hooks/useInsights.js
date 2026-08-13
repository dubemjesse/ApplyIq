import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";

export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => (await api.get("/insights")).data,
  });
}
