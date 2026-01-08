import { AdminLayout } from "@/components/layout-admin";
import { useAuth } from "@/hooks/use-auth";
import { useStudents, useAllBills, useAllReceipts } from "@/hooks/use-admin";
import { Users, CreditCard, FileCheck, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: students } = useStudents();
  const { data: bills } = useAllBills();
  const { data: receipts } = useAllReceipts();

  // Calculate stats
  const totalStudents = students?.length || 0;
  const pendingReceipts = receipts?.filter(r => r.status === 'PENDING').length || 0;
  const totalOutstanding = bills
    ?.filter(b => b.status === 'PENDING')
    .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, administrator.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalStudents}</div>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 tracking-tight">Active enrollment</p>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Receipts</CardTitle>
              <FileCheck className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{pendingReceipts}</div>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 tracking-tight">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-slate-950 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Outstanding Revenue</CardTitle>
              <div className="h-8 w-8 rounded bg-blue-600/20 flex items-center justify-center">
                <span className="text-blue-400 text-xs font-bold">$</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalOutstanding.toLocaleString()}</div>
              <p className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-tight">Pending collection</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Pending Receipts List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-slate-900">Recent Receipts</h2>
              <Link href="/admin/receipts">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 font-bold uppercase text-[10px] tracking-widest">
                  View All <ArrowUpRight className="ml-1.5 w-3 h-3" />
                </Button>
              </Link>
            </div>
            <Card className="border-slate-200/60 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {receipts?.filter(r => r.status === 'PENDING').slice(0, 5).map((receipt) => (
                  <div key={receipt.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">Bill #{receipt.billId}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verifying transaction</p>
                      </div>
                    </div>
                    <StatusBadge status={receipt.status} />
                  </div>
                ))}
                {(!receipts || receipts.filter(r => r.status === 'PENDING').length === 0) && (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                      <FileCheck className="w-6 h-6 text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">No pending receipts to review</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Students */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-slate-900">Recent Enrollment</h2>
              <Link href="/admin/students">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 font-bold uppercase text-[10px] tracking-widest">
                  Directory <ArrowUpRight className="ml-1.5 w-3 h-3" />
                </Button>
              </Link>
            </div>
            <Card className="border-slate-200/60 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {students?.slice(0, 5).map((student) => (
                  <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        {student.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{student.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{student.admissionNumber}</p>
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{student.className}</div>
                  </div>
                ))}
                 {(!students || students.length === 0) && (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">No student records found</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
