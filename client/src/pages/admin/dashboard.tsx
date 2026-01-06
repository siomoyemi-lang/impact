import { AdminLayout } from "@/components/layout-admin";
import { useAuth } from "@/hooks/use-auth";
import { useStudents, useAllBills, useAllReceipts } from "@/hooks/use-admin";
import { Users, CreditCard, FileCheck, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
              <p className="text-xs text-slate-500 mt-1">Active enrollments</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Pending Receipts</CardTitle>
              <FileCheck className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{pendingReceipts}</div>
              <p className="text-xs text-slate-500 mt-1">Requires approval</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Outstanding Bills</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">${totalOutstanding.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">Unpaid tuition & fees</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity / Pending Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Receipts List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Pending Receipts</h2>
              <Link href="/admin/receipts" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All <ArrowUpRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            <Card>
              <div className="divide-y divide-slate-100">
                {receipts?.filter(r => r.status === 'PENDING').slice(0, 5).map((receipt) => (
                  <div key={receipt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900">Bill #{receipt.billId}</p>
                      <p className="text-sm text-slate-500">Uploaded by: {receipt.uploadedBy.userId} (ID)</p>
                    </div>
                    <StatusBadge status={receipt.status} />
                  </div>
                ))}
                {(!receipts || receipts.filter(r => r.status === 'PENDING').length === 0) && (
                  <div className="p-8 text-center text-slate-500">No pending receipts</div>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Students */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Recent Students</h2>
              <Link href="/admin/students" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                Directory <ArrowUpRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            <Card>
              <div className="divide-y divide-slate-100">
                {students?.slice(0, 5).map((student) => (
                  <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {student.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{student.fullName}</p>
                        <p className="text-sm text-slate-500">{student.admissionNumber}</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">{student.className}</div>
                  </div>
                ))}
                 {(!students || students.length === 0) && (
                  <div className="p-8 text-center text-slate-500">No students found</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
