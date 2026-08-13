import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useAgentRuns() {
  return useQuery({
    queryKey: ["agentRuns"],
    queryFn: async () => (await api.get("/agent/runs")).data.runs,
  });
}

export function useRunAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post("/agent/run")).data.run,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentRuns"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}
