import { AdminLayout } from "@/components/layout-admin";
import { useCreateUser, useUsersByRole } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Shield, User } from "lucide-react";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function UserManagement() {
  const createUserMutation = useCreateUser();
  const { data: parents, isLoading: loadingParents } = useUsersByRole("PARENT");
  const { data: admins, isLoading: loadingAdmins } = useUsersByRole("ADMIN");

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

  const UserList = ({ users, isLoading, title }: { users: any[] | undefined, isLoading: boolean, title: string }) => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title} List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Account ID</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-slate-500">
                  No {title.toLowerCase()}s found.
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">#{user.id}</TableCell>
                  <TableCell className="text-right text-xs text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Create and manage accounts for administrators and parents</p>
        </div>

        <Tabs defaultValue="parent" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="parent" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Parents
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Administrators
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parent" className="space-y-6">
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
            <UserList users={parents} isLoading={loadingParents} title="Parent" />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
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
            <UserList users={admins} isLoading={loadingAdmins} title="Admin" />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
