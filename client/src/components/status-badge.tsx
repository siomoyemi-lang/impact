import { cn } from "@/lib/utils";

type StatusType = "PENDING" | "PAID" | "APPROVED" | "REJECTED";

export function StatusBadge({ status }: { status: StatusType | string }) {
  const styles = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    PAID: "bg-green-50 text-green-700 border-green-200",
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
  };

  const statusKey = status as keyof typeof styles;
  const style = styles[statusKey] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      style
    )}>
      {status}
    </span>
  );
}
