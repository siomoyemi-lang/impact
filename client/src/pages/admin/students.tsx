import { AdminLayout } from "@/components/layout-admin";
import { useStudents, useCreateStudent, useLinkParent, useDeleteStudent } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, UserPlus, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useUpdateStudent } from "@/hooks/use-admin";

const linkParentSchema = z.object({
  parentEmail: z.string().email("Invalid email"),
  studentId: z.number(),
});

export default function StudentDirectory() {
  const { data: students, isLoading } = useStudents();
  const createStudentMutation = useCreateStudent();
  const linkParentMutation = useLinkParent();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const createForm = useForm<z.infer<typeof insertStudentSchema>>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      fullName: "",
      className: "",
      admissionNumber: "",
    },
  });

  const linkForm = useForm<z.infer<typeof linkParentSchema>>({
    resolver: zodResolver(linkParentSchema),
    defaultValues: {
      parentEmail: "",
      studentId: 0, // Will be set when opening
    },
  });

  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();
  const [editOpen, setEditOpen] = useState(false);
  
  function DeleteStudentButton({ student }: { student: any }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
          <Trash className="w-4 h-4 mr-2" />Delete
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete student {student.fullName}?</DialogTitle>
            </DialogHeader>
            <div className="py-4">This will permanently remove the student record and related data. This action cannot be undone.</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { deleteMutation.mutate({ id: student.id }); setOpen(false); }}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  const editForm = useForm<z.infer<typeof insertStudentSchema>>({
    resolver: zodResolver(insertStudentSchema),
  });

  function onCreateSubmit(data: z.infer<typeof insertStudentSchema>) {
    createStudentMutation.mutate(data, {
      onSuccess: () => {
        setCreateOpen(false);
        createForm.reset();
      }
    });
  }

  function openEditModal(student: any) {
    editForm.reset({
      fullName: student.fullName,
      admissionNumber: student.admissionNumber,
      className: student.className,
      parentEmail: student.parentEmail || undefined,
    });
    setSelectedStudent(student.id);
    setEditOpen(true);
  }

  function onEditSubmit(data: z.infer<typeof insertStudentSchema>) {
    if (!selectedStudent) return;
    updateMutation.mutate({ id: selectedStudent, data }, {
      onSuccess: () => {
        setEditOpen(false);
        editForm.reset();
        setSelectedStudent(null);
      }
    });
  }

  function onLinkSubmit(data: z.infer<typeof linkParentSchema>) {
    linkParentMutation.mutate(data, {
      onSuccess: () => {
        setLinkOpen(false);
        linkForm.reset();
      }
    });
  }

  const openLinkModal = (studentId: number) => {
    setSelectedStudent(studentId);
    linkForm.setValue('studentId', studentId);
    setLinkOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Student Directory</h1>
            <p className="text-slate-500 text-sm mt-1">Manage student records and parent linkages</p>
          </div>
          
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 h-11 px-6">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Student</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-5 pt-4">
                  <div className="grid grid-cols-1 gap-5">
                    <FormField
                      control={createForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</FormLabel>
                          <FormControl><Input placeholder="John Doe" className="h-11" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="admissionNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Admission Number</FormLabel>
                            <FormControl><Input placeholder="ADM-001" className="h-11" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="className"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Class</FormLabel>
                            <FormControl><Input placeholder="JSS 1" className="h-11" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={createForm.control}
                      name="parentEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Parent Email (Optional)</FormLabel>
                          <FormControl><Input placeholder="parent@example.com" className="h-11" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 mt-2" disabled={createStudentMutation.isPending}>
                    {createStudentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Record
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[150px] font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4 px-6">Admission No</TableHead>
                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4">Name</TableHead>
                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4">Parent</TableHead>
                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4">Class</TableHead>
                <TableHead className="text-right font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-20" />
                    Loading students...
                  </TableCell>
                </TableRow>
              ) : students?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    <div className="mb-2 text-lg font-medium text-slate-300">No records found</div>
                    <p className="text-sm text-slate-400">Add your first student to get started.</p>
                  </TableCell>
                </TableRow>
              ) : (
                students?.map((student: any) => (
                  <TableRow key={student.id} className="hover:bg-slate-50/30 transition-colors group">
                    <TableCell className="font-mono text-sm text-slate-500 px-6">{student.admissionNumber}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{student.fullName}</TableCell>
                    <TableCell>
                      {student.parentEmail ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {student.parentEmail}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No parent linked</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">{student.className}</TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50"
                          onClick={() => openLinkModal(student.id)}
                        >
                          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                          Link
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-slate-600 hover:bg-slate-50"
                          onClick={() => openEditModal(student)}
                        >
                          Edit
                        </Button>
                        <DeleteStudentButton student={student} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Parent to Student</DialogTitle>
          </DialogHeader>
          <Form {...linkForm}>
            <form onSubmit={linkForm.handleSubmit(onLinkSubmit)} className="space-y-4">
              <FormField
                control={linkForm.control}
                name="parentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent's Email</FormLabel>
                    <FormControl><Input placeholder="parent@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <input type="hidden" {...linkForm.register("studentId")} />
              <Button type="submit" className="w-full" disabled={linkParentMutation.isPending}>
                {linkParentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Link Parent
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="admissionNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="className"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="parentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Email (Optional)</FormLabel>
                    <FormControl><Input placeholder="parent@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
