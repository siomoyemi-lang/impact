import { AdminLayout } from "@/components/layout-admin";
import { useCreateUser, useUsersByRole, useChangeUserPassword, useUpdateUser, useDeleteUser } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Shield, User, Edit, Trash } from "lucide-react";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol"),
});

export default function UserManagement() {
  const createUserMutation = useCreateUser();
  const { data: parents, isLoading: loadingParents } = useUsersByRole("PARENT");
  const { data: admins, isLoading: loadingAdmins } = useUsersByRole("ADMIN");
  const { data: teachers, isLoading: loadingTeachers } = useUsersByRole("TEACHER");
  const { data: accounting, isLoading: loadingAccounting } = useUsersByRole("ACCOUNTING");
  const changePasswordMutation = useChangeUserPassword();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  function EditEmailButton({ user, onSave }: { user: any; onSave: (email: string) => void }) {
    const [open, setOpen] = useState(false);
    const form = useForm<{ email: string }>({ defaultValues: { email: user.email }, resolver: zodResolver(z.object({ email: z.string().email() })) });

    return (
      <>
        <Button size="sm" variant="ghost" onClick={() => { form.reset({ email: user.email }); setOpen(true); }}>
          <Edit className="w-3 h-3 mr-2" />Edit
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit email for {user.email}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => { onSave(data.email); setOpen(false); })} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  function DeleteUserButton({ user, onDelete }: { user: any; onDelete: () => void }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
          <Trash className="w-3 h-3 text-red-500" />
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete user {user.email}?</DialogTitle>
            </DialogHeader>
            <div className="py-4">This will remove the account and associated parent links. This action cannot be undone.</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { onDelete(); setOpen(false); }}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

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
                    <div className="flex items-center justify-end gap-2">
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      <EditEmailButton user={user} onSave={(email)=>{ updateUserMutation.mutate({ id: user.id, email }); }} />
                      <DeleteUserButton user={user} onDelete={()=>{ deleteUserMutation.mutate({ id: user.id }); }} />
                      <ChangePasswordButton user={user} onChange={(pwd)=>{ changePasswordMutation.mutate({ id: user.id, password: pwd }); }} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  function ChangePasswordButton({ user, onChange }: { user: any; onChange: (pwd: string) => void }) {
    const [open, setOpen] = useState(false);
    const pwdForm = useForm<{ password: string }>({
      defaultValues: { password: "" },
      resolver: zodResolver(z.object({ password: z.string().min(12, "Password must be at least 12 characters").regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/) })),
    });

    return (
      <>
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Change Password</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change password for {user.email}</DialogTitle>
            </DialogHeader>
            <Form {...pwdForm}>
              <form onSubmit={pwdForm.handleSubmit((data)=>{ onChange(data.password); setOpen(false); pwdForm.reset(); })} className="space-y-4">
                <FormField control={pwdForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Create and manage accounts for all staff departments and parents</p>
        </div>

        <Tabs defaultValue="parent" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="parent" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Parents
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="accounting" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Accounting
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parent" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>New Parent Account</CardTitle>
                <CardDescription>Create a login for a student's guardian</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...parentForm}>
                  <form onSubmit={parentForm.handleSubmit((data) => createUserMutation.mutate({ ...data, type: 'parent' }, { onSuccess: () => parentForm.reset() }))} className="space-y-4">
                    <FormField control={parentForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input placeholder="parent@example.com" {...field} className="bg-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={parentForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><PasswordInput {...field} className="bg-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={createUserMutation.isPending}>
                      Create Parent Account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            <UserList users={parents} isLoading={loadingParents} title="Parent" />
          </TabsContent>

          <TabsContent value="teacher" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>New Teacher Account</CardTitle>
                <CardDescription>Create a login for a staff teacher</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...parentForm}>
                  <form onSubmit={parentForm.handleSubmit((data) => createUserMutation.mutate({ ...data, type: 'teacher' }, { onSuccess: () => parentForm.reset() }))} className="space-y-4">
                    <FormField control={parentForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input placeholder="teacher@school.com" {...field} className="bg-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={parentForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><PasswordInput {...field} className="bg-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={createUserMutation.isPending}>
                      Create Teacher Account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            <UserList users={teachers} isLoading={loadingTeachers} title="Teacher" />
          </TabsContent>

          <TabsContent value="accounting" className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>New Accounting Account</CardTitle>
                <CardDescription>Create a login for accounting staff</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...parentForm}>
                  <form onSubmit={parentForm.handleSubmit((data) => createUserMutation.mutate({ ...data, type: 'accounting' }, { onSuccess: () => parentForm.reset() }))} className="space-y-4">
                    <FormField control={parentForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input placeholder="accounting@school.com" {...field} className="bg-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={parentForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><PasswordInput {...field} className="bg-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={createUserMutation.isPending}>
                      Create Accounting Account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            <UserList users={accounting} isLoading={loadingAccounting} title="Accounting" />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <Card className="border-red-100 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900">New Administrator</CardTitle>
                <CardDescription>Grant full system access to a staff member</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...adminForm}>
                  <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                    <FormField control={adminForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input placeholder="admin@school.com" {...field} className="bg-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={adminForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><PasswordInput {...field} className="bg-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" variant="destructive" className="w-full" disabled={createUserMutation.isPending}>
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
