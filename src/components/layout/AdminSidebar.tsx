import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Radio, Users, ScanFace, ClipboardList, FileBarChart,
  Camera, Brain, AlertTriangle, ScrollText, ShieldCheck, Activity,
  Settings, LogOut, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/live", label: "AI Live Monitor", icon: Radio },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/enrollment", label: "Face Enrollment", icon: ScanFace },
  { to: "/admin/attendance", label: "Attendance Records", icon: ClipboardList },
  { to: "/admin/reports", label: "Reports & Export", icon: FileBarChart },
  { to: "/admin/cameras", label: "Cameras", icon: Camera },
  { to: "/admin/analytics", label: "AI Analytics", icon: Brain },
  { to: "/admin/alerts", label: "Alerts & Incidents", icon: AlertTriangle },
  { to: "/admin/audit", label: "Audit Logs", icon: ScrollText },
  { to: "/admin/roles", label: "User Roles", icon: ShieldCheck },
  { to: "/admin/health", label: "System Health", icon: Activity },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-3">
        <div className="size-9 rounded-lg bg-sidebar-primary grid place-items-center">
          <Sparkles className="size-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white tracking-tight">SmartAttend</div>
          <div className="text-[11px] text-sidebar-foreground/60">AI Attendance Platform</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <div className="px-3 pb-2 pt-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Workspace</div>
        {items.map((it) => {
          const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link to="/login" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="size-4" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
