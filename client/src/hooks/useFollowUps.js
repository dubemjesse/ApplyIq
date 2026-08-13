import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useFollowUps(applicationId) {
  return useQuery({
    queryKey: ["followUps", applicationId],
    queryFn: async () => (await api.get(`/applications/${applicationId}/followups`)).data.followUps,
    enabled: Boolean(applicationId),
  });
}

export function useCreateFollowUp(applicationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scheduledAt) =>
      (await api.post(`/applications/${applicationId}/followups`, { scheduledAt })).data.followUp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["followUps", applicationId] }),
  });
}

export function useSendFollowUpNow(applicationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followUpId) =>
      (await api.post(`/applications/${applicationId}/followups/${followUpId}/send-now`)).data.followUp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["followUps", applicationId] }),
  });
}

export function useCancelFollowUp(applicationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followUpId) => api.delete(`/applications/${applicationId}/followups/${followUpId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["followUps", applicationId] }),
  });
}
