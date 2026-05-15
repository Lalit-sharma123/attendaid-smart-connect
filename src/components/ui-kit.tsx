import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export function StatCard({
  label, value, sub, icon, tone = "default", className, to, onClick,
}: {
  label: string; value: string | number; sub?: string;
  icon?: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
  to?: string;
  onClick?: () => void;
}) {
  const toneCls = {
    default: "from-primary/10 to-primary/0 text-primary",
    success: "from-success/15 to-success/0 text-success",
    warning: "from-warning/20 to-warning/0 text-warning-foreground",
    danger: "from-destructive/15 to-destructive/0 text-destructive",
    info: "from-info/15 to-info/0 text-info",
  }[tone];

  const inner = (
    <div className={cn("relative overflow-hidden rounded-xl border bg-card p-5 h-full text-left", (to || onClick) && "hover:shadow-md hover:border-primary/40 transition-all cursor-pointer", className)}>
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r", toneCls)} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        {icon && (
          <div className={cn("size-10 rounded-lg grid place-items-center bg-gradient-to-br", toneCls)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );

  if (to) return <Link to={to as any} className="block">{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className="block w-full">{inner}</button>;
  return inner;
}

export function SectionCard({ title, action, children, className, to, onClick }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; to?: string; onClick?: () => void }) {
  const inner = (
    <div className={cn("rounded-xl border bg-card", (to || onClick) && "hover:shadow-md hover:border-primary/30 transition-all cursor-pointer", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
  if (to) return <Link to={to as any} className="block">{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className="block w-full text-left">{inner}</button>;
  return inner;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Present: "bg-success/15 text-success",
    Absent: "bg-destructive/15 text-destructive",
    Late: "bg-warning/20 text-warning-foreground",
    Unknown: "bg-muted text-muted-foreground",
    "Spoof Blocked": "bg-destructive/15 text-destructive",
    Spoof: "bg-destructive/15 text-destructive",
    Marked: "bg-success/15 text-success",
    "Already Marked": "bg-info/15 text-info",
    Active: "bg-success/15 text-success",
    Pending: "bg-warning/20 text-warning-foreground",
    Warning: "bg-destructive/15 text-destructive",
    Online: "bg-success/15 text-success",
    online: "bg-success/15 text-success",
    Degraded: "bg-warning/20 text-warning-foreground",
    degraded: "bg-warning/20 text-warning-foreground",
    Offline: "bg-destructive/15 text-destructive",
    offline: "bg-destructive/15 text-destructive",
    Critical: "bg-destructive/15 text-destructive",
    High: "bg-destructive/10 text-destructive",
    Medium: "bg-warning/20 text-warning-foreground",
    Low: "bg-muted text-muted-foreground",
    Open: "bg-destructive/15 text-destructive",
    Investigating: "bg-warning/20 text-warning-foreground",
    Resolved: "bg-success/15 text-success",
    Info: "bg-info/15 text-info",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium", map[status] ?? "bg-secondary text-secondary-foreground")}>
      {status}
    </span>
  );
}
