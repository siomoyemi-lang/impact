import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/auth/login";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import StudentDirectory from "@/pages/admin/students";
import AdminBilling from "@/pages/admin/billing";
import ReceiptApprovals from "@/pages/admin/receipts";
import ResultUploads from "@/pages/admin/results";
import UserManagement from "@/pages/admin/users";

// Parent Pages
import ParentDashboard from "@/pages/parent/dashboard";
import ParentBilling from "@/pages/parent/billing";
import ParentResults from "@/pages/parent/results";
import { Loader2 } from "lucide-react";

// Protected Route Component
function ProtectedRoute({ 
  component: Component, 
  allowedRole 
}: { 
  component: React.ComponentType<any>;
  allowedRole?: 'ADMIN' | 'PARENT';
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to correct dashboard if role doesn't match
    return <Redirect to={user.role === 'ADMIN' ? '/admin/dashboard' : '/parent/dashboard'} />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={LoginPage} />
      <Route path="/">
        <Redirect to="/auth" />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboard} allowedRole="ADMIN" />
      </Route>
      <Route path="/admin/students">
        <ProtectedRoute component={StudentDirectory} allowedRole="ADMIN" />
      </Route>
      <Route path="/admin/billing">
        <ProtectedRoute component={AdminBilling} allowedRole="ADMIN" />
      </Route>
      <Route path="/admin/receipts">
        <ProtectedRoute component={ReceiptApprovals} allowedRole="ADMIN" />
      </Route>
      <Route path="/admin/results">
        <ProtectedRoute component={ResultUploads} allowedRole="ADMIN" />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={UserManagement} allowedRole="ADMIN" />
      </Route>

      {/* Parent Routes */}
      <Route path="/parent/dashboard">
        <ProtectedRoute component={ParentDashboard} allowedRole="PARENT" />
      </Route>
      <Route path="/parent/billing">
        <ProtectedRoute component={ParentBilling} allowedRole="PARENT" />
      </Route>
      <Route path="/parent/results">
        <ProtectedRoute component={ParentResults} allowedRole="PARENT" />
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
