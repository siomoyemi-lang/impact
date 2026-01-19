import { RoleLayout } from "@/components/layout-admin";
import { useStudents, useUploadResult } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Search, FileText, Plus, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function TeacherResults() {
  const { data: students } = useStudents();
  const uploadResultMutation = useUploadResult();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      studentId: "",
      term: "",
      file: null as File | null,
    }
  });

  const selectedStudentName = useMemo(() => {
    const studentId = form.watch("studentId");
    if (!studentId || !students) return "";
    const student = students.find(s => s.id.toString() === studentId);
    return student ? `${student.fullName} (${student.admissionNumber})` : "";
  }, [form.watch("studentId"), students]);

  const onSubmit = async (data: any) => {
    if (!data.file) return;
    const formData = new FormData();
    formData.append('studentId', data.studentId);
    formData.append('term', data.term);
    formData.append('file', data.file);

    uploadResultMutation.mutate(formData, {
      onSuccess: () => {
        toast({ title: "Success", description: "Academic result uploaded successfully" });
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <RoleLayout role="TEACHER">
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-2">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Academic Results</h1>
            <p className="text-slate-500 text-sm mt-1">Upload and manage student performance reports.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-11 px-6">
                <Plus className="w-4 h-4 mr-2" /> Upload Result
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload Student Result</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Student</FormLabel>
                        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={searchOpen}
                                className={cn(
                                  "w-full justify-between h-11 font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? selectedStudentName
                                  : "Search and select student..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search student name or admission number..." />
                              <CommandList>
                                <CommandEmpty>No student found.</CommandEmpty>
                                <CommandGroup>
                                  {students?.map((s) => (
                                    <CommandItem
                                      key={s.id}
                                      value={`${s.fullName} ${s.admissionNumber}`}
                                      onSelect={() => {
                                        form.setValue("studentId", s.id.toString());
                                        setSearchOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === s.id.toString() ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {s.fullName} ({s.admissionNumber})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Term</FormLabel>
                        <FormControl><Input placeholder="First Term 2024" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Result Document (PDF/Image)</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        onChange={(e) => form.setValue('file', e.target.files?.[0] || null)} 
                        className="h-auto py-2"
                      />
                    </FormControl>
                  </FormItem>
                  <Button type="submit" className="w-full h-11" disabled={uploadResultMutation.isPending}>
                    {uploadResultMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload Record
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-12 text-center border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-200" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Academic Result Management</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            Use the button above to upload new academic records. Once uploaded, parents will be able to view them in their portals.
          </p>
        </Card>
      </div>
    </RoleLayout>
  );
}