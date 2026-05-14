import { Link, useRouterState } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { ScanFace, CalendarCheck, User, HelpCircle, LogOut, Sparkles, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/student", label: "Mark Attendance", icon: ScanFace, exact: true },
  { to: "/student/attendance", label: "My Attendance", icon: CalendarCheck },
  { to: "/student/profile", label: "My Profile", icon: User },
  { to: "/student/help", label: "Help", icon: HelpCircle },
];

export function StudentShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-3">
          <div className="size-9 rounded-lg bg-sidebar-primary grid place-items-center">
            <Sparkles className="size-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">SmartAttend</div>
            <div className="text-[11px] text-sidebar-foreground/60">Student Portal</div>
          </div>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {items.map((it) => {
            const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
                )}
              >
                <Icon className="size-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Link to="/login" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent">
            <LogOut className="size-4" /> Logout
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-6 flex items-center justify-between border-b bg-card/60 backdrop-blur sticky top-0 z-10">
          <div>
            <div className="text-sm font-semibold">Rahul Sharma</div>
            <div className="text-xs text-muted-foreground">BCA-1021 · 3rd Year · Section A</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-2 px-3 h-9 rounded-full bg-success/10 text-success text-xs font-medium">
              ● Today: Present 08:42 AM
            </span>
            <button className="size-10 rounded-lg hover:bg-secondary grid place-items-center"><Bell className="size-4" /></button>
            <div className="size-9 rounded-full bg-gradient-to-br from-primary to-info grid place-items-center text-primary-foreground text-sm font-semibold">RS</div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
