import { ParentLayout } from "@/components/layout-parent";
import { useMyBills, useUploadReceipt } from "@/hooks/use-parent";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Upload, Loader2, FileText } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ParentBilling() {
  const { data: bills, isLoading } = useMyBills();
  const uploadReceiptMutation = useUploadReceipt();
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  const handleUpload = () => {
    if (!selectedBillId || !file) return;

    // IMPORTANT: The backend hook/api expects specific structure.
    // Based on requirements, we usually use FormData.
    const formData = new FormData();
    formData.append('billId', String(selectedBillId));
    formData.append('file', file);
    
    // NOTE: This assumes the hook handles FormData as written in my hook file
    uploadReceiptMutation.mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        setFile(null);
        setSelectedBillId(null);
      }
    });
  };

  const openUploadModal = (billId: number) => {
    setSelectedBillId(billId);
    setOpen(true);
  };

  return (
    <ParentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Bills & Payments</h1>
          <p className="text-slate-500">View outstanding fees and upload payment proof</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Proof</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">Loading bills...</TableCell>
                </TableRow>
              ) : bills?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">No bills found.</TableCell>
                </TableRow>
              ) : (
                bills?.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-mono">#{bill.id}</TableCell>
                    <TableCell>{bill.student.fullName}</TableCell>
                    <TableCell>{bill.description}</TableCell>
                    <TableCell>{bill.term}</TableCell>
                    <TableCell className="font-bold font-mono">${Number(bill.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={bill.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {bill.status !== 'PAID' && (
                         <Button variant="outline" size="sm" onClick={() => openUploadModal(bill.id)}>
                           <Upload className="w-4 h-4 mr-2" />
                           Upload Receipt
                         </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Payment Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Receipt File (Image/PDF)</Label>
              <Input 
                type="file" 
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button 
              className="w-full bg-teal-600 hover:bg-teal-700" 
              disabled={!file || uploadReceiptMutation.isPending}
              onClick={handleUpload}
            >
              {uploadReceiptMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Submit Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ParentLayout>
  );
}
