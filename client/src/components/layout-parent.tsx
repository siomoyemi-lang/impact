import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Users, 
  CreditCard, 
  GraduationCap, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ParentLayout({ children }: { children: React.ReactNode }) {
  const { logoutMutation, user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'My Wards', href: '/parent/dashboard', icon: Users },
    { name: 'Bills & Payments', href: '/parent/billing', icon: CreditCard },
    { name: 'Academic Results', href: '/parent/results', icon: GraduationCap },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tight text-slate-900">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                    <span className="text-white text-lg">IH</span>
                  </div>
                  <span className="hidden sm:inline">ImpactHouse Parent</span>
                </div>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <div className={cn(
                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors cursor-pointer",
                        isActive 
                          ? "border-teal-500 text-slate-900" 
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      )}>
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-slate-500 hover:text-slate-900"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <div className={cn(
                      "block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer",
                      isActive
                        ? "bg-teal-50 border-teal-500 text-teal-700"
                        : "border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700"
                    )}>
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 pb-4 border-t border-slate-200">
              <div className="flex items-center px-4 mb-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                    PA
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-slate-800">{user?.email}</div>
                  <div className="text-sm font-medium text-slate-500">Parent Account</div>
                </div>
              </div>
              <div className="space-y-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
