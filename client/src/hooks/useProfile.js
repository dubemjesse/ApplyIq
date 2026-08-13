import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/users/me")).data.user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.put("/users/me", payload)).data.user,
    onSuccess: (user) => queryClient.setQueryData(["profile"], user),
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await api.post("/users/me/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.user;
    },
    onSuccess: (user) => queryClient.setQueryData(["profile"], user),
  });
}
