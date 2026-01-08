import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700 slide-in-from-left-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-slate-900 mb-6 shadow-xl shadow-slate-200">
              <span className="text-white font-bold text-2xl tracking-tighter italic">I</span>
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Portal Access</h1>
            <p className="mt-2 text-slate-500 font-medium">Enter your credentials to continue</p>
          </div>

          <Card className="border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden">
            <div className="h-1.5 bg-slate-900 w-full" />
            <CardHeader className="pt-8">
              <CardTitle className="text-xl">Authentication</CardTitle>
              <CardDescription className="text-slate-500">Secure access to ImpactHouse systems</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="admin@impacthouse.com" 
                            {...field} 
                            className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-md"
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
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Security Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="••••••••"
                            {...field}
                            className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 mt-2 rounded-md" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Sign In to Portal"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t border-slate-100 py-4">
              <p className="text-[10px] text-center w-full text-slate-400 font-bold uppercase tracking-[0.2em]">
                Authorized Personnel Only
              </p>
            </CardFooter>
          </Card>
          
          <p className="text-center text-xs text-slate-400 font-medium">
            Forgot password? Contact school IT support.
          </p>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-slate-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/90 to-blue-900/10"></div>
        
        <div className="relative z-10 max-w-lg space-y-8 animate-in fade-in duration-1000 slide-in-from-right-4">
          <div className="w-12 h-1 bg-blue-600 mb-2" />
          <h2 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
            Nurturing <span className="text-blue-500">Excellence</span> through Innovation.
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            A unified environment for school management, academic records, and secure financial processing.
          </p>
          
          <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-white/5">
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Digital Billing</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tighter">SECURE</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Data Access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
