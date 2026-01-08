import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  GraduationCap,
  Loader2,
  ArrowRight
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define schema for login (subset of insertUserSchema basically)
const loginSchema = z.object({
  username: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login Form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register Form
  const registerForm = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: "student",
    },
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  const onLogin = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegister = (values: z.infer<typeof insertUserSchema>) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* LEFT SIDE - Forms */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-md space-y-8 z-10">
          <div className="text-center lg:text-left mb-8 lg:hidden">
            <h1 className="text-3xl font-bold font-display text-primary">Impacthouse</h1>
          </div>

          <Card className="border-none shadow-2xl shadow-primary/5 bg-white/50 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-display font-bold text-center">
                {activeTab === "login" ? "Welcome Back" : "Create Account"}
              </CardTitle>
              <CardDescription className="text-center">
                {activeTab === "login" 
                  ? "Enter your credentials to access your portal" 
                  : "Join the Impacthouse community today"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="login" 
                value={activeTab} 
                onValueChange={(v) => setActiveTab(v as "login" | "register")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="login">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="student@impacthouse.edu" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full h-11 text-md font-semibold mt-4 transition-all hover:scale-[1.02]"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              "Login"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>

                    <TabsContent value="register">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="student@impacthouse.edu" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full h-11 text-md font-semibold mt-4 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <span className="flex items-center">
                                Create Account <ArrowRight className="ml-2 h-4 w-4" />
                              </span>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RIGHT SIDE - Branding */}
      <div className="hidden lg:flex flex-col justify-center p-12 relative bg-secondary/30">
        <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
        
        {/* Abstract shapes/blobs for visual interest */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl font-display font-bold text-primary mb-6 leading-tight">
              Impacthouse <br />
              <span className="text-foreground">college</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Welcome to your School Management Portal. Manage students, track progress, and stay connected with ease.
            </p>
          </motion.div>

          <div className="space-y-6">
            <FeatureItem 
              icon={<ShieldCheck className="w-6 h-6 text-primary" />}
              title="Secure Access"
              description="Protected data encryption ensuring your academic records are safe."
              delay={0.2}
            />
            <FeatureItem 
              icon={<LayoutDashboard className="w-6 h-6 text-primary" />}
              title="Easy Tracking"
              description="Monitor student performance and attendance in real-time."
              delay={0.3}
            />
            <FeatureItem 
              icon={<GraduationCap className="w-6 h-6 text-primary" />}
              title="Academic Excellence"
              description="Tools designed to foster growth and learning outcomes."
              delay={0.4}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 transition-colors duration-300"
    >
      <div className="p-3 bg-white rounded-lg shadow-sm border border-border/50">
        {icon}
      </div>
      <div>
        <h3 className="font-display font-semibold text-lg text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
