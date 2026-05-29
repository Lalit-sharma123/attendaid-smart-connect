import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { Plus, Upload, Search, Filter, Edit, Trash2, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { downloadCSV } from "@/lib/csv";
import {
  getStudentsApi,
  createStudentApi,
  updateStudentApi,
  deleteStudentApi,
} from "@/services/studentApi";
import { getDepartmentsApi } from "@/services/adminApi";

export const Route = createFileRoute("/admin/students")({
  component: Students,
  head: () => ({ meta: [{ title: "Students — SmartAttend" }] }),
});

type UiStudent = {
  id: string;
  roll: string;
  name: string;
  dept: string;
  cls: string;
  section: string;
  enrolled: boolean;
  attendance: number;
  status: string;
  email?: string;
  raw?: any;
};

type DepartmentOption = {
  id: string;
  name: string;
  code?: string;
  classes?: ClassOption[];
};

type ClassOption = {
  id: string;
  name: string;
  code?: string;
  sections?: SectionOption[];
};

type SectionOption = {
  id: string;
  name: string;
};

function mapStudent(s: any): UiStudent {
  const user = s.user || {};

  return {
    id: s.id,
    roll: s.rollNo || s.roll_no || s.roll || "",
    name: s.name || user.name || "",
    dept: s.department?.name || s.dept || "-",
    cls: s.courseClass?.name || s.class?.name || s.classRoom?.name || s.cls || "-",
    section: s.section?.name || s.sectionName || s.section || "-",
    enrolled: Boolean(
      s.face_enrolled ||
      s.enrolled ||
      s.faceEnrollment?.is_enrolled ||
      (Array.isArray(s.faceEnrollment) && s.faceEnrollment.length > 0)
    ),
    attendance: Number(s.attendance ?? s.attendance_percentage ?? 0),
    status: s.status || "Active",
    email: s.email || user.email,
    raw: s,
  };
}

function normalizeDepartments(data: any): DepartmentOption[] {
  const rows = Array.isArray(data) ? data : data?.items || [];

  return rows.map((d: any) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    classes: (d.classes || d.classRooms || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      sections: (c.sections || []).map((s: any) => ({
        id: s.id,
        name: s.name,
      })),
    })),
  }));
}

function Students() {
  const navigate = useNavigate();

  const [list, setList] = useState<UiStudent[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editing, setEditing] = useState<UiStudent | null>(null);
  const [viewing, setViewing] = useState<UiStudent | null>(null);
  const [deleting, setDeleting] = useState<UiStudent | null>(null);

  const [form, setForm] = useState({
    roll: "",
    name: "",
    dept: "",
    cls: "",
    section: "",
  });

  const selectedDepartment = useMemo(() => {
    return departments.find((d) => d.id === form.dept);
  }, [departments, form.dept]);

  const classOptions = selectedDepartment?.classes || [];

  const selectedClass = useMemo(() => {
    return classOptions.find((c) => c.id === form.cls);
  }, [classOptions, form.cls]);

  const sectionOptions = selectedClass?.sections || [];

  async function loadStudents() {
    setLoading(true);

    try {
      const data = await getStudentsApi();
      const rows = Array.isArray(data) ? data : data?.items || [];
      setList(rows.map(mapStudent));
    } catch (error: any) {
      toast.error(error.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      const data = await getDepartmentsApi();
      const rows = normalizeDepartments(data);

      setDepartments(rows);

      if (rows.length > 0) {
        const firstDept = rows[0];
        const firstClass = firstDept.classes?.[0];
        const firstSection = firstClass?.sections?.[0];

        setForm((prev) => ({
          ...prev,
          dept: prev.dept || firstDept.id,
          cls: prev.cls || firstClass?.id || "",
          section: prev.section || firstSection?.id || "",
        }));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load departments");
    }
  }

  useEffect(() => {
    loadStudents();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (!selectedDepartment) return;

    const firstClass = selectedDepartment.classes?.[0];
    const classStillValid = selectedDepartment.classes?.some((c) => c.id === form.cls);

    if (!classStillValid) {
      setForm((prev) => ({
        ...prev,
        cls: firstClass?.id || "",
        section: firstClass?.sections?.[0]?.id || "",
      }));
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (!selectedClass) return;

    const firstSection = selectedClass.sections?.[0];
    const sectionStillValid = selectedClass.sections?.some((s) => s.id === form.section);

    if (!sectionStillValid) {
      setForm((prev) => ({
        ...prev,
        section: firstSection?.id || "",
      }));
    }
  }, [selectedClass]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;

    return list.filter((s) => {
      return (
        s.name.toLowerCase().includes(term) ||
        s.roll.toLowerCase().includes(term)
      );
    });
  }, [list, q]);

  const handleAdd = async () => {
    if (!form.roll || !form.name) {
      toast.error("Roll and name required");
      return;
    }

    if (!form.dept || !form.cls || !form.section) {
      toast.error("Please create/select department, class and section first");
      return;
    }

    try {
      await createStudentApi({
        name: form.name,
        email: `${form.roll.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "")}@student.attendaid.com`,
        password: "Student@123",
        roll_no: form.roll,
        department_id: form.dept,
        class_id: form.cls,
        section_id: form.section,
      });

      await loadStudents();

      setAddOpen(false);
      setForm((prev) => ({
        roll: "",
        name: "",
        dept: prev.dept,
        cls: prev.cls,
        section: prev.section,
      }));

      toast.success("Student added");
    } catch (error: any) {
      toast.error(error.message || "Failed to add student");
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;

    try {
      await updateStudentApi(editing.id, {
        name: editing.name,
      });

      await loadStudents();
      toast.success("Saved");
      setEditing(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to save student");
    }
  };


  async function handleDelete() {
    if (!deleting?.id) return;

    try {
      await deleteStudentApi(deleting.id);
      setList((prev) => prev.filter((s) => s.id !== deleting.id));
      setDeleting(null);
      toast.success("Student deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete student");
    }
  }


  const handleToggleStatus = async (student: UiStudent) => {
    const nextStatus = student.status === "Active" ? "Disabled" : "Active";

    try {
      await updateStudentApi(student.id, {
        status: nextStatus,
      } as any);

      await loadStudents();
      toast.success("Status updated");
      setViewing(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Student Management</h1>
          <p className="text-sm text-muted-foreground">
            {list.length} students · {list.filter((s) => s.enrolled).length} face-enrolled · {list.filter((s) => !s.enrolled).length} pending enrollment
            {loading ? " · loading..." : ""}
          </p>
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
                <tr key={s.id || s.roll} onClick={() => setViewing(s)} className="border-t hover:bg-secondary/30 cursor-pointer">
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
                      <button onClick={() => setEditing({ ...s })} className="size-7 rounded grid place-items-center hover:bg-secondary"><Edit className="size-3.5" /></button>
                      <button onClick={() => setDeleting(s)} className="size-7 rounded grid place-items-center hover:bg-secondary text-destructive"><Trash2 className="size-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No students found.
                  </td>
                </tr>
              )}
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
                {departments.length === 0 ? (
                  <option value="">No departments</option>
                ) : (
                  departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)
                )}
              </select>
              <select value={form.cls} onChange={(e) => setForm({ ...form, cls: e.target.value })} className="h-9 px-2 rounded-md border bg-card text-sm">
                {classOptions.length === 0 ? (
                  <option value="">No classes</option>
                ) : (
                  classOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                )}
              </select>
              <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="h-9 px-2 rounded-md border bg-card text-sm">
                {sectionOptions.length === 0 ? (
                  <option value="">No sections</option>
                ) : (
                  sectionOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                )}
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
                  <button onClick={() => { setEditing({ ...viewing }); setViewing(null); }} className="h-9 rounded-md border text-sm">Edit</button>
                  <button onClick={() => handleToggleStatus(viewing)} className="h-9 rounded-md border text-sm">Toggle Status</button>
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
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full h-9 px-3 rounded-md border bg-card outline-none focus:ring-2 focus:ring-ring text-sm" />
              <DialogFooter>
                <button onClick={() => setEditing(null)} className="h-9 px-4 rounded-md border text-sm">Cancel</button>
                <button onClick={handleSaveEdit} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Save</button>
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
        onConfirm={handleDelete}
      />
    </div>
  );
}