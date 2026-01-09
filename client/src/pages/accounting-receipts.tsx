import { RoleLayout } from "@/components/layout-admin";
import { useAllReceipts, useUpdateReceiptStatus } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Check, X, Eye } from "lucide-react";

export default function AccountingReceipts() {
  const { data: receipts, isLoading } = useAllReceipts();
  const updateStatusMutation = useUpdateReceiptStatus();

  const handleAction = (id: number, status: "APPROVED" | "REJECTED") => {
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <RoleLayout role="ACCOUNTING">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Receipt Review</h1>
          <p className="text-slate-500">Approve or reject parent payment submissions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="px-6">ID</TableHead>
                <TableHead>Bill ID</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : receipts?.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-mono px-6">#{receipt.id}</TableCell>
                  <TableCell className="font-mono">#{receipt.billId}</TableCell>
                  <TableCell>
                    <a href={receipt.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                      <Eye className="w-3 h-3 mr-1" /> View
                    </a>
                  </TableCell>
                  <TableCell><StatusBadge status={receipt.status} /></TableCell>
                  <TableCell className="text-right px-6 space-x-2">
                    {receipt.status === 'PENDING' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8" onClick={() => handleAction(receipt.id, 'APPROVED')}>
                          <Check className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="h-8" onClick={() => handleAction(receipt.id, 'REJECTED')}>
                          <X className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      </>
                    )}
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
