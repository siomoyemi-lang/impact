import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const loginSchema = z.object({
  username: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { loginMutation, user } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') setLocation('/admin/dashboard');
      else setLocation('/parent/dashboard');
    }
  }, [user, setLocation]);

  function onSubmit(data: z.infer<typeof loginSchema>) {
    loginMutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700 slide-in-from-left-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-6 shadow-lg shadow-blue-600/20">
              <span className="text-white font-bold text-xl">IH</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Welcome back</h1>
            <p className="mt-2 text-slate-600">Sign in to your account</p>
          </div>

          <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your credentials to access the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="parent@example.com" 
                            {...field} 
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="••••••••"
                            {...field}
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <p className="text-center text-sm text-slate-500">
            Forgot your password? Contact school administration.
          </p>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-slate-900/90"></div>
        
        <div className="relative z-10 max-w-lg text-center space-y-6 animate-in fade-in duration-1000 slide-in-from-right-4">
          <h2 className="text-4xl font-display font-bold text-white leading-tight">
            Secure Academic & Financial Management
          </h2>
          <p className="text-lg text-blue-100/80">
            Streamline your school's operations with our comprehensive portal. Track student progress, manage billing, and ensure transparent communication.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <h3 className="font-bold text-white">Real-time Tracking</h3>
              <p className="text-sm text-blue-100/60">Instant access to grades and results</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <h3 className="font-bold text-white">Secure Payments</h3>
              <p className="text-sm text-blue-100/60">Easy bill management and receipt uploads</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
