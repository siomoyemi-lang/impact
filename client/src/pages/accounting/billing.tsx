import { RoleLayout } from "@/components/layout-admin";
import { useAllBills } from "@/hooks/use-admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function AccountingBilling() {
  const { data: bills, isLoading } = useAllBills();

  return (
    <RoleLayout role="ACCOUNTING">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Billing Records</h1>
          <p className="text-slate-500 text-sm mt-1">Full overview of all generated student bills.</p>
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