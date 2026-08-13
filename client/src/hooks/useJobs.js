import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useJobs(filters) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: async () => (await api.get("/jobs", { params: filters })).data,
  });
}

export function useScrapeJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (filters) => (await api.post("/jobs/scrape", filters)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useMatchJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId) => (await api.post(`/jobs/${jobId}/match`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });
}
