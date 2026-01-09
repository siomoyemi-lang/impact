import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileCheck, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./global-search";

export function RoleLayout({ children, role }: { children: React.ReactNode, role: 'ADMIN' | 'TEACHER' | 'ACCOUNTING' }) {
  const { logoutMutation, user } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationMap = {
    ADMIN: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Student Directory', href: '/admin/students', icon: Users },
      { name: 'Billing Overview', href: '/admin/billing', icon: CreditCard },
      { name: 'Receipt Approvals', href: '/admin/receipts', icon: FileCheck },
      { name: 'Result Uploads', href: '/admin/results', icon: FileText },
      { name: 'User Management', href: '/admin/users', icon: Settings },
    ],
    TEACHER: [
      { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
      { name: 'Manage Students', href: '/teacher/students', icon: Users },
      { name: 'Send Bills', href: '/teacher/billing', icon: CreditCard },
      { name: 'Upload Results', href: '/teacher/results', icon: FileText },
    ],
    ACCOUNTING: [
      { name: 'Dashboard', href: '/accounting/dashboard', icon: LayoutDashboard },
      { name: 'Billing Overview', href: '/accounting/billing', icon: CreditCard },
      { name: 'Receipt Approvals', href: '/accounting/receipts', icon: FileCheck },
    ]
  };

  const navigation = navigationMap[role] || [];
  const roleLabel = role === 'ACCOUNTING' ? 'Accounting' : (role.charAt(0) + role.slice(1).toLowerCase());

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col border-r border-slate-800 shadow-xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-xl tracking-tight">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white text-lg font-bold">I</span>
            </div>
            <span className="text-white">ImpactHouse</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="px-3 mb-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">
            {roleLabel} Panel
          </div>
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer group mb-1",
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}>
                  <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{roleLabel}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-10 px-3 no-default-hover-elevate no-default-active-elevate"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
          <button 
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex justify-center px-4 max-w-2xl mx-auto">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="ADMIN">{children}</RoleLayout>;
}
