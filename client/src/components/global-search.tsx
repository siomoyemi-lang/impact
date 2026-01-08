import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User, GraduationCap, FileText, Command as CommandIcon } from "lucide-react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data: students } = useQuery<any[]>({
    queryKey: ["/api/admin/students"],
    enabled: open,
  });

  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/admin/users/ADMIN"],
    enabled: open,
  });

  const onSelect = (path: string) => {
    setLocation(path);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors w-64 border border-slate-200"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search students or staff..." />
        <CommandList className="max-h-[450px]">
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => onSelect("/admin/students")}>
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>Go to Student Directory</span>
            </CommandItem>
            <CommandItem onSelect={() => onSelect("/admin/billing")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>View Billing Overview</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {students && students.length > 0 && (
            <CommandGroup heading="Students">
              {students.slice(0, 5).map((student) => (
                <CommandItem
                  key={student.id}
                  onSelect={() => onSelect(`/admin/students?id=${student.id}`)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <div className="font-medium">{student.firstName} {student.lastName}</div>
                      <div className="text-xs text-slate-500">Grade: {student.grade} • ID: {student.studentId}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] h-5">{student.enrollmentStatus}</Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          {users && users.length > 0 && (
            <CommandGroup heading="Administrators">
              {users.slice(0, 3).map((admin) => (
                <CommandItem
                  key={admin.id}
                  onSelect={() => onSelect("/admin/users")}
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-medium">{admin.email}</div>
                    <div className="text-xs text-slate-500">Administrator</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
