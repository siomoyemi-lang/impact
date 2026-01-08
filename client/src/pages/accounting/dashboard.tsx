import { RoleLayout } from "@/components/layout-admin";
import { useAuth } from "@/hooks/use-auth";
import { useAllBills, useAllReceipts } from "@/hooks/use-admin";
import { CreditCard, FileCheck, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AccountingDashboard() {
  const { user } = useAuth();
  const { data: bills } = useAllBills();
  const { data: receipts } = useAllReceipts();

  const pendingReceipts = receipts?.filter(r => r.status === 'PENDING').length || 0;
  const totalOutstanding = bills
    ?.filter(b => b.status === 'PENDING')
    .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <RoleLayout role="ACCOUNTING">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Accounting Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Review receipts and manage school finances.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Approvals</CardTitle>
              <FileCheck className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{pendingReceipts}</div>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 tracking-tight">Receipts to verify</p>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200/60 shadow-sm bg-slate-950 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Outstanding</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalOutstanding.toLocaleString()}</div>
              <p className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-tight">Pending revenue</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-slate-900">Recent Receipts</h2>
            <Link href="/accounting/receipts">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 font-bold uppercase text-[10px] tracking-widest">
                Review All <ArrowUpRight className="ml-1.5 w-3 h-3" />
              </Button>
            </Link>
          </div>
          <Card className="border-slate-200/60 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {receipts?.filter(r => r.status === 'PENDING').slice(0, 5).map((receipt) => (
                <div key={receipt.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Bill #{receipt.billId}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Awaiting approval</p>
                  </div>
                  <div className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">PENDING</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </RoleLayout>
  );
}