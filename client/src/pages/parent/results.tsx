import { ParentLayout } from "@/components/layout-parent";
import { useMyWards, useStudentResults } from "@/hooks/use-parent";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useState } from "react";

// Helper component to fetch results for a selected student
function ResultsList({ studentId }: { studentId: number }) {
  const { data: results, isLoading } = useStudentResults(studentId);

  if (isLoading) return <div className="text-center py-8 text-slate-500">Loading results...</div>;
  if (!results || results.length === 0) return <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">No results published yet.</div>;

  return (
    <div className="grid gap-4">
      {results.map((result) => (
        <Card key={result.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{result.term} Report Card</h4>
                <p className="text-sm text-slate-500">Published {new Date(result.createdAt!).toLocaleDateString()}</p>
              </div>
            </div>
            <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50" asChild>
              <a href={result.fileUrl} target="_blank" rel="noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ParentResults() {
  const { data: wards, isLoading } = useMyWards();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Select first student by default when wards load
  if (!selectedStudentId && wards && wards.length > 0) {
    setSelectedStudentId(String(wards[0].id));
  }

  return (
    <ParentLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Academic Results</h1>
            <p className="text-slate-500">Download report cards for your children</p>
          </div>
          
          <div className="w-full sm:w-64">
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>
              <SelectContent>
                {wards?.map((ward) => (
                  <SelectItem key={ward.id} value={String(ward.id)}>
                    {ward.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
           <div className="text-center py-12">Loading...</div>
        ) : !wards || wards.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No students linked to your account.</div>
        ) : (
          <div className="mt-8">
             {selectedStudentId && <ResultsList studentId={Number(selectedStudentId)} />}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
