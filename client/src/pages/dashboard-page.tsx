import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  User, 
  Bell, 
  Search, 
  BookOpen, 
  Clock, 
  Calendar 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="font-display font-bold text-primary text-xl">I</span>
          </div>
          <span className="font-display font-bold text-xl hidden md:inline-block">Impacthouse</span>
        </div>

        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search courses, students, or resources..." 
              className="pl-10 bg-secondary/50 border-transparent focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-white" />
          </Button>
          
          <div className="h-8 w-[1px] bg-border mx-1" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{user?.name || "Student"}</p>
              <p className="text-xs text-muted-foreground mt-1">{user?.role || "Student"}</p>
            </div>
            <div className="h-9 w-9 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium shadow-lg shadow-primary/20">
              {user?.name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-6 max-w-7xl space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your courses today.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => logoutMutation.mutate()}
            className="w-full md:w-auto border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title="Current Courses" 
            value="4" 
            icon={<BookOpen className="h-5 w-5 text-blue-500" />}
            color="bg-blue-50"
          />
          <StatsCard 
            title="Attendance Rate" 
            value="92%" 
            icon={<Clock className="h-5 w-5 text-green-500" />}
            color="bg-green-50"
          />
          <StatsCard 
            title="Upcoming Exams" 
            value="2" 
            icon={<Calendar className="h-5 w-5 text-purple-500" />}
            color="bg-purple-50"
          />
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart/Table Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest academic updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-xl bg-muted/20">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground font-medium">No recent activity</p>
                    <p className="text-xs text-muted-foreground/60">Check back later for updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <Card className="shadow-sm border-border/50 bg-primary text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
              <CardHeader>
                <CardTitle className="relative z-10">Upcoming Event</CardTitle>
                <CardDescription className="text-primary-foreground/80 relative z-10">
                  Science Fair 2024
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                  <p className="font-mono text-2xl font-bold">OCT 15</p>
                  <p className="text-sm opacity-80">9:00 AM - Main Hall</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatsCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold font-display">{value}</h3>
        </div>
        <div className={`h-12 w-12 rounded-full ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
