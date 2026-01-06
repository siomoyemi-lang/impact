import { AdminLayout } from "@/components/layout-admin";
import { useStudents, useUploadResult } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, UploadCloud } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { insertResultSchema } from "@shared/schema";

// Form schema extending base to include file object for validaton if needed, 
// though we handle file upload via standard input
const formSchema = insertResultSchema.extend({
  studentId: z.coerce.number(),
  // fileUrl will be set after "fake" upload or we can use it as a text input for external URLs
  // For this demo, let's treat fileUrl as a text input for simplicity or mock file handling
  fileUrl: z.string().min(1, "File URL or path is required")
});

export default function ResultUploads() {
  const { data: students } = useStudents();
  const uploadResultMutation = useUploadResult();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: 0,
      term: "",
      fileUrl: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    // In a real app, we'd upload the file first to storage, get URL, then save record.
    // Here we just save the record with the URL provided.
    // If the input was a file, we'd handle it differently.
    // Assuming admin pastes a link or we have a file picker that returns a URL.
    
    // NOTE: The API expects the JSON payload for the record creation.
    // We are cheating a bit and just sending the metadata directly.
    
    // To satisfy the hook's expectation of FormData (from my earlier hook definition),
    // I need to adjust. But wait, in `use-admin.ts` I wrote `body: JSON.stringify(data)`.
    // So it expects an object. Good.
    
    // Wait, insertResultSchema expects an object.
    
    uploadResultMutation.mutate(data as any, { // Type assertion for simplicity
      onSuccess: () => {
        form.reset();
      }
    });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Upload Results</h1>
          <p className="text-slate-500">Publish academic result sheets for students</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Result Details</CardTitle>
              <CardDescription>Upload a PDF or Image of the result sheet</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students?.map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.fullName} ({s.admissionNumber})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <FormControl><Input placeholder="Spring 2024" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File URL (Mock Upload)</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                             <Input placeholder="https://storage.example.com/result.pdf" {...field} />
                          </div>
                        </FormControl>
                        <p className="text-xs text-slate-500">Enter a direct link to the result file.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={uploadResultMutation.isPending}>
                    {uploadResultMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Publish Result
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
