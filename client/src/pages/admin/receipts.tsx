import { AdminLayout } from "@/components/layout-admin";
import { useAllReceipts, useUpdateReceiptStatus } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Loader2, Check, X, Eye } from "lucide-react";

export default function ReceiptApprovals() {
  const { data: receipts, isLoading } = useAllReceipts();
  const updateStatusMutation = useUpdateReceiptStatus();

  const handleAction = (id: number, status: "APPROVED" | "REJECTED") => {
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Receipt Approvals</h1>
          <p className="text-slate-500">Review and approve payment proofs</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading receipts...</TableCell>
                </TableRow>
              ) : receipts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">No receipts found.</TableCell>
                </TableRow>
              ) : (
                receipts?.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-mono">#{receipt.billId}</TableCell>
                    <TableCell>Parent #{receipt.uploadedByParentId}</TableCell>
                    <TableCell>{new Date(receipt.createdAt!).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <a 
                        href={receipt.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center text-blue-600 hover:underline"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View File
                      </a>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={receipt.status} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {receipt.status === 'PENDING' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAction(receipt.id, 'APPROVED')}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleAction(receipt.id, 'REJECTED')}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
