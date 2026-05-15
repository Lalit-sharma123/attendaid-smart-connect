import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { students as initialStudents } from "@/lib/mock-data";
import { Plus, Upload, Search, Filter, Edit, Trash2, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { downloadCSV } from "@/lib/csv";

export const Route = createFileRoute("/admin/students")({
  component: Students,
  head: () => ({ meta: [{ title: "Students — SmartAttend" }] }),
});

function Students() {
  const navigate = useNavigate();
  const [list, setList] = useState(initialStudents);
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editing, setEditing] = useState<typeof initialStudents[number] | null>(null);
  const [viewing, setViewing] = useState<typeof initialStudents[number] | null>(null);
  const [deleting, setDeleting] = useState<typeof initialStudents[number] | null>(null);
  const [form, setForm] = useState({ roll: "", name: "", dept: "BCA", cls: "1st Year", section: "A" });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((s) => s.name.toLowerCase().includes(term) || s.roll.toLowerCase().includes(term));
  }, [list, q]);

  const handleAdd = () => {
    if (!form.roll || !form.name) { toast.error("Roll and name required"); return; }
    setList((p) => [{ ...form, enrolled: false, attendance: 0, status: "Pending" }, ...p]);
    setAddOpen(false); setForm({ roll: "", name: "", dept: "BCA", cls: "1st Year", section: "A" });
    toast.success("Student added");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Student Management</h1>
          <p className="text-sm text-muted-foreground">{list.length} students · {list.filter((s) => s.enrolled).length} face-enrolled · {list.filter((s) => !s.enrolled).length} pending enrollment</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadCSV(`students-${Date.now()}.csv`, list)} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"><Download className="size-4" /> Export CSV</button>
          <button onClick={() => setBulkOpen(true)} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"><Upload className="size-4" /> Bulk Upload CSV</button>
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Plus className="size-4" /> Add Student</button>
        </div>
      </div>

      <SectionCard>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by roll number or name…" className="w-full h-9 pl-9 pr-3 rounded-md bg-secondary/60 outline-none text-sm focus:bg-card focus:ring-2 focus:ring-ring" />
          </div>
          {["Department: All", "Class: All", "Section: All", "Status: All", "Enrollment: All"].map((f) => (
            <button key={f} onClick={() => toast(`${f} — filter applied`)} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-xs hover:bg-secondary">
              <Filter className="size-3.5" /> {f}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-secondary/30">
              <tr className="text-left">
                <th className="px-5 py-2.5 font-medium">Photo</th>
                <th className="px-5 py-2.5 font-medium">Roll No</th>
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Department</th>
                <th className="px-5 py-2.5 font-medium">Class</th>
                <th className="px-5 py-2.5 font-medium">Section</th>
                <th className="px-5 py-2.5 font-medium">Face Enrollment</th>
                <th className="px-5 py-2.5 font-medium">Attendance %</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.roll} onClick={() => setViewing(s)} className="border-t hover:bg-secondary/30 cursor-pointer">
                  <td className="px-5 py-3">
                    <div className="size-8 rounded-full bg-gradient-to-br from-primary/30 to-info/30 grid place-items-center text-[10px] font-semibold">
                      {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{s.roll}</td>
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{s.dept}</td>
                  <td className="px-5 py-3 text-muted-foreground">{s.cls}</td>
                  <td className="px-5 py-3 text-muted-foreground">{s.section}</td>
                  <td className="px-5 py-3"><StatusBadge status={s.enrolled ? "Active" : "Pending"} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full ${s.attendance >= 75 ? "bg-success" : s.attendance >= 60 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${s.attendance}%` }} />
                      </div>
                      <span className="text-xs tabular-nums">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex gap-1">
                      <button onClick={() => setViewing(s)} className="size-7 rounded grid place-items-center hover:bg-secondary"><Eye className="size-3.5" /></button>
                      <button onClick={() => setEditing(s)} className="size-7 rounded grid place-items-center hover:bg-secondary"><Edit className="size-3.5" /></button>
                      <button onClick={() => setDeleting(s)} className="size-7 rounded grid place-items-center hover:bg-secondary text-destructive"><Trash2 className="size-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Add */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Student</DialogTitle><DialogDescription>Create a new student record.</DialogDescription></DialogHeader>
          <div className="space-y-3 text-sm">
            <input value={form.roll} onChange={(e) => setForm({ ...form, roll: e.target.value })} placeholder="Roll No (e.g. BCA-1099)" className="w-full h-9 px-3 rounded-md border bg-card outline-none focus:ring-2 focus:ring-ring" />
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="w-full h-9 px-3 rounded-md border bg-card outline-none focus:ring-2 focus:ring-ring" />
            <div className="grid grid-cols-3 gap-2">
              <select value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} className="h-9 px-2 rounded-md border bg-card text-sm">
                {["BCA", "BBA", "MCA", "MBA", "B.Tech", "M.Tech"].map((d) => <option key={d}>{d}</option>)}
              </select>
              <select value={form.cls} onChange={(e) => setForm({ ...form, cls: e.target.value })} className="h-9 px-2 rounded-md border bg-card text-sm">
                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="h-9 px-2 rounded-md border bg-card text-sm">
                {["A", "B", "C"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setAddOpen(false)} className="h-9 px-4 rounded-md border text-sm">Cancel</button>
            <button onClick={handleAdd} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Create Student</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bulk Upload CSV</DialogTitle><DialogDescription>CSV columns: roll, name, dept, cls, section</DialogDescription></DialogHeader>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="size-8 mx-auto text-muted-foreground" />
            <div className="text-sm font-medium mt-2">Drop CSV here</div>
            <div className="text-xs text-muted-foreground">or click to browse</div>
            <input type="file" accept=".csv" className="mt-3 text-xs" />
          </div>
          <DialogFooter>
            <button onClick={() => setBulkOpen(false)} className="h-9 px-4 rounded-md border text-sm">Cancel</button>
            <button onClick={() => { toast.success("CSV imported · 0 rows added (demo)"); setBulkOpen(false); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Import</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Drawer */}
      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {viewing && (
            <>
              <SheetHeader>
                <SheetTitle>{viewing.name}</SheetTitle>
                <SheetDescription className="font-mono">{viewing.roll}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span className="text-muted-foreground">Department</span><span>{viewing.dept}</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span className="text-muted-foreground">Class · Section</span><span>{viewing.cls} · {viewing.section}</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span className="text-muted-foreground">Attendance</span><span>{viewing.attendance}%</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span className="text-muted-foreground">Face Enrolled</span><span>{viewing.enrolled ? "Yes" : "No"}</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span className="text-muted-foreground">Status</span><StatusBadge status={viewing.status} /></div>
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <button onClick={() => { navigate({ to: "/admin/enrollment" }); setViewing(null); }} className="h-9 rounded-md border text-sm">Enroll Face</button>
                  <button onClick={() => { navigate({ to: "/admin/attendance" }); setViewing(null); }} className="h-9 rounded-md border text-sm">View Attendance</button>
                  <button onClick={() => { setEditing(viewing); setViewing(null); }} className="h-9 rounded-md border text-sm">Edit</button>
                  <button onClick={() => { setList((p) => p.map((s) => s.roll === viewing.roll ? { ...s, status: s.status === "Active" ? "Disabled" : "Active" } : s)); toast.success("Status updated"); setViewing(null); }} className="h-9 rounded-md border text-sm">Toggle Status</button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          {editing && (
            <>
              <DialogHeader><DialogTitle>Edit Student</DialogTitle><DialogDescription className="font-mono">{editing.roll}</DialogDescription></DialogHeader>
              <input defaultValue={editing.name} onChange={(e) => (editing.name = e.target.value)} className="w-full h-9 px-3 rounded-md border bg-card outline-none focus:ring-2 focus:ring-ring text-sm" />
              <DialogFooter>
                <button onClick={() => setEditing(null)} className="h-9 px-4 rounded-md border text-sm">Cancel</button>
                <button onClick={() => { setList((p) => p.map((s) => s.roll === editing.roll ? { ...s, name: editing.name } : s)); toast.success("Saved"); setEditing(null); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Save</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description="This action cannot be undone."
        confirmLabel="Delete" destructive
        onConfirm={() => { if (deleting) { setList((p) => p.filter((s) => s.roll !== deleting.roll)); toast.success("Student deleted"); } setDeleting(null); }}
      />
    </div>
  );
}
