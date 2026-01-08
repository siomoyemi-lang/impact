import { RoleLayout } from "@/components/layout-admin";
import { useAllReceipts, useUpdateReceiptStatus } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCheck, ExternalLink, Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AccountingReceipts() {
  const { data: receipts, isLoading } = useAllReceipts();
  const updateStatusMutation = useUpdateReceiptStatus();
  const { toast } = useToast();

  const handleStatus = (id: number, status: 'APPROVED' | 'REJECTED') => {
    updateStatusMutation.mutate({ id, status }, {
      onSuccess: () => {
        toast({ title: "Status Updated", description: `Receipt has been ${status.toLowerCase()}` });
      }
    });
  };

  return (
    <RoleLayout role="ACCOUNTING">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Receipt Approvals</h1>
          <p className="text-slate-500 text-sm mt-1">Review and approve parent-uploaded payment receipts.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="px-6 py-4">Bill ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : (
                receipts?.map((receipt: any) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="px-6 font-mono text-sm">#{receipt.billId}</TableCell>
                    <TableCell className="font-semibold">${Number(receipt.bill?.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-slate-600">{receipt.uploadedBy?.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${receipt.status === 'APPROVED' ? 'bg-green-100 text-green-700' : receipt.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {receipt.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={receipt.fileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
                          </a>
                        </Button>
                        {receipt.status === 'PENDING' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleStatus(receipt.id, 'APPROVED')}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleStatus(receipt.id, 'REJECTED')}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
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