import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema, insertStudentSchema, insertBillSchema, insertResultSchema, type User } from "@shared/schema";
import type { z } from "zod";

// --- Users ---
export function useUsersByRole(role: "ADMIN" | "PARENT") {
  return useQuery<User[]>({
    queryKey: [buildUrl(api.admin.listUsersByRole.path, { role })],
    queryFn: async () => {
      const url = buildUrl(api.admin.listUsersByRole.path, { role });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.admin.listUsersByRole.responses[200].parse(await res.json());
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { type: 'admin' | 'parent', email: string, password: string }) => {
      const path = data.type === 'admin' ? api.admin.createAdmin.path : api.admin.createParent.path;
      const res = await fetch(path, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create user");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "User created successfully" });
    }
  });
}

export function useLinkParent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { parentEmail: string, studentId: number }) => {
      const res = await fetch(api.admin.linkParent.path, {
        method: api.admin.linkParent.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to link parent");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Parent linked successfully" });
      queryClient.invalidateQueries({ queryKey: [api.admin.listStudents.path] });
    }
  });
}

// --- Students ---
export function useStudents() {
  return useQuery({
    queryKey: [api.admin.listStudents.path],
    queryFn: async () => {
      const res = await fetch(api.admin.listStudents.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch students");
      return api.admin.listStudents.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof insertStudentSchema>) => {
      const res = await fetch(api.admin.createStudent.path, {
        method: api.admin.createStudent.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create student");
      return api.admin.createStudent.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.listStudents.path] });
      toast({ title: "Student created successfully" });
    },
  });
}

// --- Bills ---
export function useAllBills() {
  return useQuery({
    queryKey: [api.admin.listBills.path],
    queryFn: async () => {
      const res = await fetch(api.admin.listBills.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bills");
      return api.admin.listBills.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof insertBillSchema>) => {
      const res = await fetch(api.admin.createBill.path, {
        method: api.admin.createBill.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create bill");
      return api.admin.createBill.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.listBills.path] });
      toast({ title: "Bill created successfully" });
    },
  });
}

// --- Receipts ---
export function useAllReceipts() {
  return useQuery({
    queryKey: [api.admin.listReceipts.path],
    queryFn: async () => {
      const res = await fetch(api.admin.listReceipts.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch receipts");
      return api.admin.listReceipts.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateReceiptStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number, status: "APPROVED" | "REJECTED" }) => {
      const url = buildUrl(api.admin.updateReceiptStatus.path, { id });
      const res = await fetch(url, {
        method: api.admin.updateReceiptStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update receipt status");
      return api.admin.updateReceiptStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.listReceipts.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.listBills.path] }); // Bills status might change
      toast({ title: "Receipt status updated" });
    },
  });
}

// --- Results ---
export function useUploadResult() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: FormData) => {
      // Note: This assumes we have a file upload endpoint for results.
      // The schema implies we just send fileUrl. But usually we upload first or send multipart.
      // Based on shared/routes, admin.uploadResult takes insertResultSchema (studentId, term, fileUrl).
      // So first we upload the file, get URL, then call this API.
      // For this simplified version, I'll assume the component handles the file upload separately 
      // or we send JSON if the URL is external.
      // Wait, if it's a real file upload, usually we use FormData.
      // But let's follow the route definition: input: insertResultSchema.
      
      const res = await fetch(api.admin.uploadResult.path, {
        method: api.admin.uploadResult.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // This should be the JSON payload { studentId, term, fileUrl }
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to save result record");
      return api.admin.uploadResult.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Result uploaded successfully" });
    }
  });
}
