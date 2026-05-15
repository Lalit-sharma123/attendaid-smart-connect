import { useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { ScanFace, CalendarCheck, User, HelpCircle, LogOut, Sparkles, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

const items = [
  { to: "/student", label: "Mark Attendance", icon: ScanFace, exact: true },
  { to: "/student/attendance", label: "My Attendance", icon: CalendarCheck },
  { to: "/student/profile", label: "My Profile", icon: User },
  { to: "/student/help", label: "Help", icon: HelpCircle },
];

const initialNotifs = [
  { id: 1, title: "Attendance marked", body: "Today 08:42 AM at Main Gate", time: "2h ago" },
  { id: 2, title: "Computer Networks at 72%", body: "Attend 4 more classes to recover.", time: "Yesterday" },
  { id: 3, title: "Profile reminder", body: "Verify your phone number.", time: "3d ago" },
];

export function StudentShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notifs, setNotifs] = useState(initialNotifs);

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
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
          >
            <LogOut className="size-4" /> Logout
          </button>
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
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative size-10 rounded-lg hover:bg-secondary grid place-items-center">
                  <Bell className="size-4" />
                  {notifs.length > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="text-sm font-semibold">Notifications</div>
                  <button onClick={() => { setNotifs([]); toast.success("All cleared"); }} className="text-xs text-primary">Clear all</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">No notifications</div>
                  ) : notifs.map((n) => (
                    <div key={n.id} className="px-4 py-3 border-b last:border-0">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{n.time}</div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button className="size-9 rounded-full bg-gradient-to-br from-primary to-info grid place-items-center text-primary-foreground text-sm font-semibold">RS</button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 p-1.5">
                <button onClick={() => navigate({ to: "/student/profile" })} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-secondary">My Profile</button>
                <button onClick={() => navigate({ to: "/student/help" })} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-secondary">Help</button>
                <div className="my-1 border-t" />
                <button onClick={() => setConfirmOpen(true)} className="w-full text-left px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10">Sign out</button>
              </PopoverContent>
            </Popover>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8"><Outlet /></main>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Sign out?"
        description="You'll need to sign in again."
        confirmLabel="Sign out"
        destructive
        onConfirm={() => { toast.success("Signed out"); navigate({ to: "/login" }); }}
      />
    </div>
  );
}
