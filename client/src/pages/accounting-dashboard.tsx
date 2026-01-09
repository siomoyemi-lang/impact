import { RoleLayout } from "@/components/layout-admin";
import { useAuth } from "@/hooks/use-auth";
import { useAllBills, useAllReceipts } from "@/hooks/use-admin";
import { CreditCard, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

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
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Accounting Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Manage school finances and approvals.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Approvals</CardTitle>
              <FileCheck className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{pendingReceipts}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-slate-950 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Outstanding</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalOutstanding.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Awaiting Confirmation</h2>
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {receipts?.filter(r => r.status === 'PENDING').slice(0, 10).map((receipt) => (
                <div key={receipt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Receipt #{receipt.id}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bill #{receipt.billId}</p>
                  </div>
                  <StatusBadge status={receipt.status} />
                </div>
              ))}
              {(!receipts || receipts.filter(r => r.status === 'PENDING').length === 0) && (
                <div className="p-12 text-center text-slate-400">No pending receipts</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </RoleLayout>
  );
}
