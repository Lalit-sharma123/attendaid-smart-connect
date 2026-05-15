import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { attendanceRecords } from "@/lib/mock-data";
import { Search, Filter, Download, Edit3, ChevronLeft, ChevronRight, Printer, RefreshCw, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { downloadCSV } from "@/lib/csv";

export const Route = createFileRoute("/admin/attendance")({
  component: Attendance,
  head: () => ({ meta: [{ title: "Attendance Records — SmartAttend" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ status: typeof s.status === "string" ? s.status : undefined, dept: typeof s.dept === "string" ? s.dept : undefined }),
});

function Attendance() {
  const search = Route.useSearch();
  const [records, setRecords] = useState(() => [...attendanceRecords, ...attendanceRecords].map((r, i) => ({ ...r, _id: i })));
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(search.status ?? "All");
  const [deptFilter, setDeptFilter] = useState<string>(search.dept ?? "All");
  const [viewing, setViewing] = useState<(typeof records)[number] | null>(null);
  const [correcting, setCorrecting] = useState<(typeof records)[number] | null>(null);
  const [reason, setReason] = useState("");
  const [newStatus, setNewStatus] = useState("Present");
  const [printOpen, setPrintOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return records.filter((r) =>
      (statusFilter === "All" || r.status === statusFilter) &&
      (deptFilter === "All" || r.dept === deptFilter) &&
      (!term || r.name.toLowerCase().includes(term) || r.roll.toLowerCase().includes(term))
    );
  }, [records, q, statusFilter, deptFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance Records</h1>
          <p className="text-sm text-muted-foreground">Filter, audit, and export attendance with full chain-of-custody.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setRecords([...attendanceRecords, ...attendanceRecords].map((r, i) => ({ ...r, _id: i }))); toast.success("Refreshed"); }} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"><RefreshCw className="size-4" /> Refresh</button>
          <button onClick={() => { downloadCSV(`attendance-${Date.now()}.csv`, filtered.map(({ _id, ...r }) => r)); toast.success("CSV downloaded"); }} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"><Download className="size-4" /> Export CSV</button>
          <button onClick={() => toast.success("Excel export queued")} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"><FileSpreadsheet className="size-4" /> Excel</button>
          <button onClick={() => setPrintOpen(true)} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"><Printer className="size-4" /> Print</button>
          <button onClick={() => toast.success("PDF export queued")} className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Download className="size-4" /> Export PDF</button>
        </div>
      </div>

      <SectionCard>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or roll number…" className="w-full h-9 pl-9 pr-3 rounded-md bg-secondary/60 outline-none text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-md border text-xs bg-card">
            {["All", "Present", "Absent", "Late", "Spoof Blocked"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="h-9 px-3 rounded-md border text-xs bg-card">
            {["All", "BCA", "BBA", "MCA", "MBA", "B.Tech", "M.Tech"].map((d) => <option key={d}>{d}</option>)}
          </select>
          {["Date: Today", "Section: All", "Camera: All", "Confidence ≥70%", "Liveness ≥60%"].map((f) => (
            <button key={f} onClick={() => toast(`${f}`)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border text-xs hover:bg-secondary">
              <Filter className="size-3" /> {f}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-secondary/30">
              <tr className="text-left">
                <th className="px-3 py-2.5"><input type="checkbox" /></th>
                <th className="px-3 py-2.5 font-medium">Date</th>
                <th className="px-3 py-2.5 font-medium">Roll No</th>
                <th className="px-3 py-2.5 font-medium">Student</th>
                <th className="px-3 py-2.5 font-medium">Dept</th>
                <th className="px-3 py-2.5 font-medium">Class</th>
                <th className="px-3 py-2.5 font-medium">Sec</th>
                <th className="px-3 py-2.5 font-medium">Check-in</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Conf</th>
                <th className="px-3 py-2.5 font-medium">Live</th>
                <th className="px-3 py-2.5 font-medium">Camera</th>
                <th className="px-3 py-2.5 font-medium">Verified</th>
                <th className="px-3 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id} onClick={() => setViewing(r)} className="border-t hover:bg-secondary/30 cursor-pointer">
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td className="px-3 py-3 text-muted-foreground tabular-nums">{r.date}</td>
                  <td className="px-3 py-3 font-mono text-xs">{r.roll}</td>
                  <td className="px-3 py-3 font-medium">{r.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.dept}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.cls}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.section}</td>
                  <td className="px-3 py-3 tabular-nums">{r.time}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-3 tabular-nums">{r.confidence}%</td>
                  <td className="px-3 py-3 tabular-nums">{r.liveness}%</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.camera}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.verifiedBy}</td>
                  <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setCorrecting(r); setNewStatus(r.status); setReason(""); }} className="inline-flex items-center gap-1 text-xs text-primary"><Edit3 className="size-3" /> Correct</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={14} className="text-center py-12 text-sm text-muted-foreground">No matching records.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div>Showing 1–{filtered.length} of {records.length} records</div>
          <div className="flex items-center gap-1">
            <button onClick={() => toast("Previous page")} className="size-7 rounded grid place-items-center border"><ChevronLeft className="size-3.5" /></button>
            {[1, 2, 3, "…", 67].map((p, i) => (
              <button key={i} onClick={() => toast(`Page ${p}`)} className={`size-7 rounded text-xs ${p === 1 ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{p}</button>
            ))}
            <button onClick={() => toast("Next page")} className="size-7 rounded grid place-items-center border"><ChevronRight className="size-3.5" /></button>
          </div>
        </div>
      </SectionCard>

      {/* View drawer */}
      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {viewing && (
            <>
              <SheetHeader>
                <SheetTitle>{viewing.name}</SheetTitle>
                <SheetDescription>{viewing.roll} · {viewing.date} · {viewing.time}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-2 text-sm">
                {Object.entries(viewing).filter(([k]) => k !== "_id").map(([k, v]) => (
                  <div key={k} className="flex justify-between p-2.5 rounded bg-secondary/50"><span className="text-muted-foreground">{k}</span><span className="font-medium">{String(v)}</span></div>
                ))}
                <button onClick={() => { setCorrecting(viewing); setNewStatus(viewing.status); setReason(""); setViewing(null); }} className="mt-3 w-full h-9 rounded-md bg-primary text-primary-foreground text-sm">Manual Correction</button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Manual correction */}
      <Dialog open={!!correcting} onOpenChange={(o) => !o && setCorrecting(null)}>
        <DialogContent className="max-w-md">
          {correcting && (
            <>
              <DialogHeader><DialogTitle>Manual Attendance Correction</DialogTitle><DialogDescription>{correcting.name} · {correcting.roll}</DialogDescription></DialogHeader>
              <div className="space-y-3 text-sm">
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full h-9 px-3 rounded-md border bg-card text-sm">
                  {["Present", "Absent", "Late", "Spoof Blocked"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for correction (required)" className="w-full h-20 px-3 py-2 rounded-md border bg-card text-sm resize-none" />
              </div>
              <DialogFooter>
                <button onClick={() => setCorrecting(null)} className="h-9 px-4 rounded-md border text-sm">Cancel</button>
                <button onClick={() => {
                  if (!reason.trim()) { toast.error("Reason required"); return; }
                  setRecords((p) => p.map((r) => r._id === correcting._id ? { ...r, status: newStatus, verifiedBy: "Admin" } : r));
                  toast.success("Correction saved · audit logged");
                  setCorrecting(null);
                }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Save Correction</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Print preview */}
      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Print Preview</DialogTitle><DialogDescription>Daily Attendance · 14 May 2026</DialogDescription></DialogHeader>
          <div className="border rounded-md bg-secondary/20 p-6 max-h-96 overflow-y-auto text-xs">
            <div className="font-semibold text-base mb-3">Attendance Report — {filtered.length} records</div>
            <table className="w-full"><thead><tr className="text-left text-muted-foreground"><th className="py-1">Roll</th><th>Name</th><th>Status</th></tr></thead>
              <tbody>{filtered.slice(0, 30).map((r) => <tr key={r._id} className="border-t"><td className="py-1 font-mono">{r.roll}</td><td>{r.name}</td><td>{r.status}</td></tr>)}</tbody></table>
          </div>
          <DialogFooter>
            <button onClick={() => { window.print(); setPrintOpen(false); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Print Now</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
