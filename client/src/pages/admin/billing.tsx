import { AdminLayout } from "@/components/layout-admin";
import { useStudents, useAllBills, useCreateBill } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBillSchema } from "@shared/schema";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminBilling() {
  const { data: bills, isLoading: billsLoading } = useAllBills();
  const { data: students } = useStudents();
  const createBillMutation = useCreateBill();
  const [createOpen, setCreateOpen] = useState(false);
  const [location] = useLocation();

  // Zod coerces form strings to numbers for studentId and amount
  const formSchema = insertBillSchema.extend({
    studentId: z.coerce.number(),
    amount: z.coerce.string() // keeping as string for input, drizzle handles numeric
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: 0,
      amount: "",
      term: "",
      description: "",
      status: "PENDING"
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('studentId');
    const action = params.get('action');

    if (action === 'create' && studentId) {
      setCreateOpen(true);
      form.setValue('studentId', parseInt(studentId));
    }
  }, [location, form]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    createBillMutation.mutate(data, {
      onSuccess: () => {
        setCreateOpen(false);
        form.reset();
      }
    });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Billing Overview</h1>
            <p className="text-slate-500">Create and manage student bills</p>
          </div>
          
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                <Plus className="w-4 h-4 mr-2" />
                Create Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Bill</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students?.map((s: any) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.fullName} ({s.admissionNumber})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Term</FormLabel>
                        <FormControl><Input placeholder="Fall 2024" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Input placeholder="Tuition fees..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createBillMutation.isPending}>
                    {createBillMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Bill
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading bills...</TableCell>
                </TableRow>
              ) : bills?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">No bills found.</TableCell>
                </TableRow>
              ) : (
                bills?.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-mono">#{bill.id}</TableCell>
                    <TableCell className="font-medium text-slate-900">{bill.student.fullName}</TableCell>
                    <TableCell>{bill.term}</TableCell>
                    <TableCell>{bill.description}</TableCell>
                    <TableCell className="font-bold font-mono">${Number(bill.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={bill.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
