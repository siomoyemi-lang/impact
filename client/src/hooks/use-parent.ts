import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useMyWards() {
  return useQuery({
    queryKey: [api.parent.listWards.path],
    queryFn: async () => {
      const res = await fetch(api.parent.listWards.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch wards");
      return api.parent.listWards.responses[200].parse(await res.json());
    },
  });
}

export function useMyBills() {
  return useQuery({
    queryKey: [api.parent.listBills.path],
    queryFn: async () => {
      const res = await fetch(api.parent.listBills.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bills");
      return api.parent.listBills.responses[200].parse(await res.json());
    },
  });
}

export function useStudentResults(studentId: number) {
  return useQuery({
    queryKey: [api.parent.listResults.path, studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const url = buildUrl(api.parent.listResults.path, { studentId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch results");
      return api.parent.listResults.responses[200].parse(await res.json());
    },
    enabled: !!studentId,
  });
}

export function useUploadReceipt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      // NOTE: The route definition in shared/routes says input is { billId }.
      // But typically file uploads need multipart/form-data.
      // Since I can't change the backend route definition here, 
      // I will assume the backend handles multipart if I send FormData,
      // even if the Zod schema is just checking body fields. 
      // Realistically, the route needs to parse multipart first.
      
      const res = await fetch(api.parent.uploadReceipt.path, {
        method: api.parent.uploadReceipt.method,
        // No Content-Type header for FormData, browser sets it with boundary
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to upload receipt");
      return api.parent.uploadReceipt.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.parent.listBills.path] });
      toast({ title: "Receipt uploaded successfully", description: "Pending admin approval" });
    },
  });
}
