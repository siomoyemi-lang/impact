import { ParentLayout } from "@/components/layout-parent";
import { useAuth } from "@/hooks/use-auth";
import { useMyWards } from "@/hooks/use-parent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function ParentDashboard() {
  const { user } = useAuth();
  const { data: wards, isLoading } = useMyWards();

  return (
    <ParentLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">My Wards</h1>
          <p className="text-slate-500 mt-1">Students linked to your account</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading your wards...</div>
        ) : wards?.length === 0 ? (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900">No Students Linked</h3>
              <p className="text-slate-500 max-w-sm mt-2">
                Please contact the school administration to link your account with your children's records.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wards?.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow border-slate-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-lg font-bold text-teal-700">
                      {student.fullName.charAt(0)}
                    </div>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                      {student.className}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-xl mb-1">{student.fullName}</CardTitle>
                  <p className="text-sm text-slate-500 mb-6">Admission No: {student.admissionNumber}</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/parent/results">
                      <div className="text-center p-3 rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-700 cursor-pointer transition-colors group">
                        <span className="text-sm font-semibold">View Results</span>
                        <ArrowRight className="w-4 h-4 mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                    <Link href="/parent/billing">
                      <div className="text-center p-3 rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-700 cursor-pointer transition-colors group">
                        <span className="text-sm font-semibold">View Bills</span>
                        <ArrowRight className="w-4 h-4 mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
