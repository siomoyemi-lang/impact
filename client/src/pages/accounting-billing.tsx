import { RoleLayout } from "@/components/layout-admin";
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

export default function AccountingBilling() {
  const { data: bills, isLoading: billsLoading } = useAllBills();
  const { data: students } = useStudents();
  const createBillMutation = useCreateBill();
  const [createOpen, setCreateOpen] = useState(false);
  const [location] = useLocation();

  const formSchema = insertBillSchema.extend({
    studentId: z.coerce.number(),
    amount: z.coerce.string()
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

  function onSubmit(data: z.infer<typeof formSchema>) {
    createBillMutation.mutate(data, {
      onSuccess: () => {
        setCreateOpen(false);
        form.reset();
      }
    });
  }

  return (
    <RoleLayout role="ACCOUNTING">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Accounting Billing</h1>
            <p className="text-slate-500 text-sm mt-1">Generate and manage school invoices.</p>
          </div>
          
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-11 px-6">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Generate Student Bill</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Student</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ? String(field.value) : undefined}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select student" />
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
              <TableRow className="bg-slate-50">
                <TableHead className="py-4 px-6">ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="px-6 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billsLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : bills?.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-mono text-sm px-6">#{bill.id}</TableCell>
                  <TableCell className="font-medium">{bill.student.fullName}</TableCell>
                  <TableCell>{bill.term}</TableCell>
                  <TableCell className="font-bold font-mono">${Number(bill.amount).toLocaleString()}</TableCell>
                  <TableCell className="px-6 text-right">
                    <StatusBadge status={bill.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </RoleLayout>
  );
}
