import { AdminLayout } from "@/components/layout-admin";
import { useCreateUser } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function UserManagement() {
  const createUserMutation = useCreateUser();

  const adminForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: "", password: "" },
  });

  const parentForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: "", password: "" },
  });

  function onAdminSubmit(data: z.infer<typeof userSchema>) {
    createUserMutation.mutate({ ...data, type: 'admin' }, {
      onSuccess: () => adminForm.reset()
    });
  }

  function onParentSubmit(data: z.infer<typeof userSchema>) {
    createUserMutation.mutate({ ...data, type: 'parent' }, {
      onSuccess: () => parentForm.reset()
    });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Create accounts for administrators and parents</p>
        </div>

        <Tabs defaultValue="parent" className="max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="parent">Create Parent</TabsTrigger>
            <TabsTrigger value="admin">Create Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="parent">
            <Card>
              <CardHeader>
                <CardTitle>New Parent Account</CardTitle>
                <CardDescription>Create a login for a student's guardian</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...parentForm}>
                  <form onSubmit={parentForm.handleSubmit(onParentSubmit)} className="space-y-4">
                    <FormField
                      control={parentForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input placeholder="parent@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={parentForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl><Input type="password" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Parent Account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card className="border-red-100 bg-red-50/10">
              <CardHeader>
                <CardTitle className="text-red-900">New Administrator</CardTitle>
                <CardDescription>Grant full system access to a staff member</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...adminForm}>
                  <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                    <FormField
                      control={adminForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input placeholder="admin@school.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={adminForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl><Input type="password" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" variant="destructive" className="w-full" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Admin Account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
