import { Bell, Search, Bot, Sun, Download, CircleDot } from "lucide-react";

export function AdminTopbar() {
  return (
    <header className="h-16 px-6 flex items-center gap-4 border-b bg-card/60 backdrop-blur-sm sticky top-0 z-20">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          placeholder="Search students, roll no, class, camera, incidents…"
          className="w-full h-10 pl-9 pr-4 rounded-lg bg-secondary/60 border border-transparent focus:bg-card focus:border-ring outline-none text-sm"
        />
      </div>
      <div className="hidden lg:flex items-center text-xs text-muted-foreground tabular-nums">
        Thu, 14 May 2026 · 09:24 AM IST
      </div>
      <div className="flex items-center gap-2 px-3 h-9 rounded-full bg-success/10 text-success text-xs font-medium">
        <CircleDot className="size-3.5 animate-pulse" /> System Online
      </div>
      <button className="relative size-10 rounded-lg hover:bg-secondary grid place-items-center" aria-label="Notifications">
        <Bell className="size-4" />
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
      </button>
      <button className="size-10 rounded-lg hover:bg-secondary grid place-items-center" aria-label="AI Assistant">
        <Bot className="size-4" />
      </button>
      <button className="size-10 rounded-lg hover:bg-secondary grid place-items-center" aria-label="Toggle theme">
        <Sun className="size-4" />
      </button>
      <button className="hidden md:inline-flex items-center gap-2 h-10 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
        <Download className="size-4" /> Export
      </button>
      <div className="flex items-center gap-3 pl-3 border-l">
        <div className="text-right hidden md:block">
          <div className="text-sm font-medium leading-tight">Dr. A. Mehra</div>
          <div className="text-xs text-muted-foreground">Super Admin</div>
        </div>
        <div className="size-9 rounded-full bg-gradient-to-br from-primary to-info grid place-items-center text-primary-foreground text-sm font-semibold">
          AM
        </div>
      </div>
    </header>
  );
}
