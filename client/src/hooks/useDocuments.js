import { useMutation } from "@tanstack/react-query";
import api from "../utils/api";

export function useGenerateDocuments() {
  return useMutation({
    mutationFn: async (jobId) => (await api.post("/documents/generate", { jobId })).data,
  });
}

export async function downloadDocument(id, format, filename) {
  const res = await api.get(`/documents/${id}/download`, {
    params: { format },
    responseType: "blob",
  });
  const url = URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
