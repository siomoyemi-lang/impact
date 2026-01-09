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
      
      // Clean up URL parameters without reloading to prevent form reopening on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Billing Overview</h1>
            <p className="text-slate-500 text-sm mt-1">Create and manage student bills</p>
          </div>
          
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 h-11 px-6">
                <Plus className="w-4 h-4 mr-2" />
                Create Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Generate New Bill</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Student</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Amount ($)</FormLabel>
                          <FormControl><Input type="number" className="h-11" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="term"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Term</FormLabel>
                          <FormControl><Input placeholder="Fall 2024" className="h-11" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</FormLabel>
                        <FormControl><Input placeholder="Tuition fees..." className="h-11" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 mt-2" disabled={createBillMutation.isPending}>
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
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4 px-6">Bill ID</TableHead>
                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4">Student</TableHead>
                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4">Term</TableHead>
                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4">Description</TableHead>
                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4">Amount</TableHead>
                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4 px-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-20" />
                    Loading bills...
                  </TableCell>
                </TableRow>
              ) : bills?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="mb-2 text-lg font-medium text-slate-300">No bills found</div>
                    <p className="text-sm text-slate-400">Bills you create will appear here.</p>
                  </TableCell>
                </TableRow>
              ) : (
                bills?.map((bill) => (
                  <TableRow key={bill.id} className="hover:bg-slate-50/30 transition-colors">
                    <TableCell className="font-mono text-sm text-slate-500 px-6">#{bill.id}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{bill.student.fullName}</TableCell>
                    <TableCell className="text-slate-600 font-medium">{bill.term}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{bill.description}</TableCell>
                    <TableCell className="font-bold font-mono text-slate-900">${Number(bill.amount).toLocaleString()}</TableCell>
                    <TableCell className="px-6">
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
