import { useState, useMemo } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Bell, Search, Bot, Sun, Moon, Download, CircleDot, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDarkMode } from "@/lib/dark-mode";
import { students, attendanceRecords, cameras } from "@/lib/mock-data";

const initialNotifs = [
  { id: 1, title: "Spoof attempt blocked", body: "Mobile screen detected at Main Gate", time: "2m ago", read: false, to: "/admin/alerts" as const },
  { id: 2, title: "Camera 3 degraded", body: "FPS dropped to 18, latency 220ms", time: "12m ago", read: false, to: "/admin/cameras" as const },
  { id: 3, title: "Low attendance digest", body: "5 students flagged this week", time: "1h ago", read: false, to: "/admin/analytics" as const },
  { id: 4, title: "BCA-1023 attendance corrected", body: "By admin@uni.edu", time: "2h ago", read: true, to: "/admin/audit" as const },
];

export function AdminTopbar() {
  const navigate = useNavigate();
  const { dark, toggle } = useDarkMode();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [notifs, setNotifs] = useState(initialNotifs);

  const unread = notifs.filter((n) => !n.read).length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { students: [], records: [], cameras: [] };
    return {
      students: students.filter((s) => s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q)).slice(0, 4),
      records: attendanceRecords.filter((r) => r.name.toLowerCase().includes(q) || r.roll.toLowerCase().includes(q)).slice(0, 3),
      cameras: cameras.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [query]);

  return (
    <header className="h-16 px-6 flex items-center gap-4 border-b bg-card/60 backdrop-blur-sm sticky top-0 z-20">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearchOpen(!!e.target.value); }}
          onFocus={() => setSearchOpen(!!query)}
          placeholder="Search students, roll no, class, camera, incidents…"
          className="w-full h-10 pl-9 pr-4 rounded-lg bg-secondary/60 border border-transparent focus:bg-card focus:border-ring outline-none text-sm"
        />
        {searchOpen && query && (
          <div className="absolute top-12 left-0 right-0 z-30 rounded-lg border bg-popover shadow-xl max-h-[400px] overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-2 border-b text-xs text-muted-foreground">
              <span>Results for "{query}"</span>
              <button onClick={() => { setQuery(""); setSearchOpen(false); }}><X className="size-3.5" /></button>
            </div>
            {results.students.length === 0 && results.records.length === 0 && results.cameras.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">No matches found</div>
            )}
            {results.students.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">Students</div>
                {results.students.map((s) => (
                  <Link key={s.roll} to="/admin/students" onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between px-2 py-2 rounded hover:bg-secondary text-sm">
                    <span>{s.name}</span><span className="font-mono text-xs text-muted-foreground">{s.roll}</span>
                  </Link>
                ))}
              </div>
            )}
            {results.records.length > 0 && (
              <div className="p-2 border-t">
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">Attendance</div>
                {results.records.map((r) => (
                  <Link key={r.roll + r.time} to="/admin/attendance" onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between px-2 py-2 rounded hover:bg-secondary text-sm">
                    <span>{r.name} · {r.time}</span><span className="text-xs text-muted-foreground">{r.status}</span>
                  </Link>
                ))}
              </div>
            )}
            {results.cameras.length > 0 && (
              <div className="p-2 border-t">
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">Cameras</div>
                {results.cameras.map((c) => (
                  <Link key={c.id} to="/admin/cameras" onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between px-2 py-2 rounded hover:bg-secondary text-sm">
                    <span>{c.name}</span><span className="text-xs text-muted-foreground">{c.id}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hidden lg:flex items-center text-xs text-muted-foreground tabular-nums">
        Thu, 14 May 2026 · 09:24 AM IST
      </div>

      <button onClick={() => setStatusOpen(true)} className="flex items-center gap-2 px-3 h-9 rounded-full bg-success/10 text-success text-xs font-medium hover:bg-success/15">
        <CircleDot className="size-3.5 animate-pulse" /> System Online
      </button>

      <Popover>
        <PopoverTrigger asChild>
          <button className="relative size-10 rounded-lg hover:bg-secondary grid place-items-center" aria-label="Notifications">
            <Bell className="size-4" />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="text-sm font-semibold">Notifications</div>
            <button onClick={() => { setNotifs(notifs.map((n) => ({ ...n, read: true }))); toast.success("All marked as read"); }}
              className="text-xs text-primary">Mark all read</button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.map((n) => (
              <button key={n.id}
                onClick={() => { setNotifs((p) => p.map((x) => x.id === n.id ? { ...x, read: true } : x)); navigate({ to: n.to }); }}
                className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-secondary/60 ${!n.read ? "bg-primary/5" : ""}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="text-sm font-medium">{n.title}</div>
                  {!n.read && <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{n.time}</div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <button onClick={() => toast("Hi! Open the AI Assistant from the bottom-right corner.")}
        className="size-10 rounded-lg hover:bg-secondary grid place-items-center" aria-label="AI Assistant">
        <Bot className="size-4" />
      </button>

      <button onClick={toggle} className="size-10 rounded-lg hover:bg-secondary grid place-items-center" aria-label="Toggle theme">
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>

      <button onClick={() => setExportOpen(true)} className="hidden md:inline-flex items-center gap-2 h-10 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
        <Download className="size-4" /> Export
      </button>

      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-3 pl-3 border-l cursor-pointer">
            <div className="text-right hidden md:block">
              <div className="text-sm font-medium leading-tight">Dr. A. Mehra</div>
              <div className="text-xs text-muted-foreground">Super Admin</div>
            </div>
            <div className="size-9 rounded-full bg-gradient-to-br from-primary to-info grid place-items-center text-primary-foreground text-sm font-semibold">AM</div>
          </div>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-1.5">
          <button onClick={() => navigate({ to: "/admin/roles" })} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-secondary">My Profile</button>
          <button onClick={() => navigate({ to: "/admin/settings" })} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-secondary">Account Settings</button>
          <button onClick={() => toast.success("Activity log opened")} className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-secondary">My Activity</button>
          <div className="my-1 border-t" />
          <button onClick={() => navigate({ to: "/login" })} className="w-full text-left px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10">Sign out</button>
        </PopoverContent>
      </Popover>

      {/* System status modal */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>System Status</DialogTitle>
            <DialogDescription>All systems operational. Live snapshot.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            {[
              ["Backend API", "Healthy", "42ms"],
              ["PostgreSQL", "Healthy", "8ms"],
              ["Recognition Model", "Healthy", "84ms"],
              ["Liveness Model", "Degraded", "210ms"],
              ["Stream Service", "Healthy", "92ms"],
            ].map(([name, status, latency]) => (
              <div key={name} className="flex items-center justify-between p-2.5 rounded-md bg-secondary/40">
                <span className="font-medium">{name}</span>
                <span className={status === "Healthy" ? "text-success text-xs" : "text-warning-foreground text-xs"}>● {status} · {latency}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <button onClick={() => { setStatusOpen(false); navigate({ to: "/admin/health" }); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Open System Health</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export modal */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Export</DialogTitle>
            <DialogDescription>Choose what to export. Downloads start immediately.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Today's Attendance (CSV)", to: "/admin/attendance" },
              { label: "Student Roster (CSV)", to: "/admin/students" },
              { label: "Audit Logs (CSV)", to: "/admin/audit" },
              { label: "Reports Hub", to: "/admin/reports" },
            ].map((opt) => (
              <button key={opt.label}
                onClick={() => { setExportOpen(false); navigate({ to: opt.to as any }); toast.success("Opening export"); }}
                className="p-3 rounded-md border text-sm text-left hover:bg-secondary">
                {opt.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
