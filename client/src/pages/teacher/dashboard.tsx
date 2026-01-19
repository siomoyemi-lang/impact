import { RoleLayout } from "@/components/layout-admin";
import { useAuth } from "@/hooks/use-auth";
import { useStudents, useAllBills } from "@/hooks/use-admin";
import { Users, CreditCard, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data: students } = useStudents();
  const { data: bills } = useAllBills();

  const totalStudents = students?.length || 0;
  const totalOutstanding = bills
    ?.filter(b => b.status === 'PENDING')
    .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <RoleLayout role="TEACHER">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Teacher Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your students and academic records.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalStudents}</div>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 tracking-tight">Active enrollment</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-slate-900">Recent Students</h2>
            <Link href="/teacher/students">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 font-bold uppercase text-[10px] tracking-widest">
                View Directory <ArrowUpRight className="ml-1.5 w-3 h-3" />
              </Button>
            </Link>
          </div>
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {students?.slice(0, 5).map((student) => (
                <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
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
            </div>
          </Card>
        </div>
      </div>
    </RoleLayout>
  );
}