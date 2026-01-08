import { RoleLayout } from "@/components/layout-admin";
import { useStudents, useCreateBill, useAllBills } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBillSchema } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";

export default function TeacherBilling() {
  const { data: students } = useStudents();
  const { data: bills, isLoading } = useAllBills();
  const createBillMutation = useCreateBill();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof insertBillSchema>>({
    resolver: zodResolver(insertBillSchema),
    defaultValues: {
      studentId: 0,
      amount: "0",
      term: "",
      description: "",
    },
  });

  function onSubmit(data: z.infer<typeof insertBillSchema>) {
    createBillMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  }

  return (
    <RoleLayout role="TEACHER">
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-2">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Student Billing</h1>
            <p className="text-slate-500 text-sm mt-1">Generate and view bills for your students.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-11 px-6">
                <Plus className="w-4 h-4 mr-2" /> Create Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Generate New Bill</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {students?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.fullName} ({s.admissionNumber})</SelectItem>)}
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
                        <FormLabel>Amount</FormLabel>
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
                        <FormControl><Input placeholder="First Term 2024" {...field} /></FormControl>
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
                        <FormControl><Input placeholder="Tuition Fee" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-11" disabled={createBillMutation.isPending}>
                    {createBillMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Bill
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
                <TableHead className="px-6 py-4">Student</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : (
                bills?.map((bill: any) => (
                  <TableRow key={bill.id}>
                    <TableCell className="px-6 font-medium">{bill.student?.fullName}</TableCell>
                    <TableCell>{bill.term}</TableCell>
                    <TableCell className="font-semibold">${Number(bill.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${bill.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {bill.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </RoleLayout>
  );
}