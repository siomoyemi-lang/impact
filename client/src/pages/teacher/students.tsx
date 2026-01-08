import { RoleLayout } from "@/components/layout-admin";
import { useStudents, useCreateStudent, useLinkParent } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, UserPlus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";

const linkParentSchema = z.object({
  parentEmail: z.string().email("Invalid email"),
  studentId: z.number(),
});

export default function TeacherStudents() {
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
      studentId: 0,
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
    <RoleLayout role="TEACHER">
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-2">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Manage Students</h1>
            <p className="text-slate-500 text-sm mt-1">Create and manage your student records.</p>
          </div>
          
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-11 px-6">
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
                  <FormField
                    control={createForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
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
                          <FormLabel>Admission Number</FormLabel>
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
                          <FormLabel>Class</FormLabel>
                          <FormControl><Input placeholder="JSS 1" className="h-11" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={createStudentMutation.isPending}>
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
              <TableRow className="bg-slate-50">
                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4 px-6">Admission No</TableHead>
                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4">Name</TableHead>
                <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4">Class</TableHead>
                <TableHead className="text-right font-bold text-slate-500 text-[11px] uppercase tracking-wider py-4 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : (
                students?.map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-sm text-slate-500 px-6">{student.admissionNumber}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{student.fullName}</TableCell>
                    <TableCell className="text-slate-600 font-medium">{student.className}</TableCell>
                    <TableCell className="text-right px-6">
                      <Button variant="outline" size="sm" onClick={() => openLinkModal(student.id)}>
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Link Parent
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
          <DialogHeader><DialogTitle>Link Parent to Student</DialogTitle></DialogHeader>
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
              <Button type="submit" className="w-full" disabled={linkParentMutation.isPending}>
                {linkParentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Link Parent
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </RoleLayout>
  );
}