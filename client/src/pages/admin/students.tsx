import { AdminLayout } from "@/components/layout-admin";
import { useStudents, useCreateStudent, useLinkParent } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";

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

  function onCreateSubmit(data: z.infer<typeof insertStudentSchema>) {
    createStudentMutation.mutate(data, {
      onSuccess: () => {
        setCreateOpen(false);
        createForm.reset();
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Student Directory</h1>
            <p className="text-slate-500">Manage student records and parent linkages</p>
          </div>
          
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
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
                    control={createForm.control}
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
                    control={createForm.control}
                    name="className"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createStudentMutation.isPending}>
                    {createStudentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Record
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admission No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">Loading students...</TableCell>
                </TableRow>
              ) : students?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">No students found.</TableCell>
                </TableRow>
              ) : (
                students?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono">{student.admissionNumber}</TableCell>
                    <TableCell className="font-medium text-slate-900">{student.fullName}</TableCell>
                    <TableCell>{student.className}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openLinkModal(student.id)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Link Parent
                      </Button>
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
    </AdminLayout>
  );
}
