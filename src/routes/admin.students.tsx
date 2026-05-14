import { createFileRoute } from "@tanstack/react-router";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { students } from "@/lib/mock-data";
import { Plus, Upload, Search, Filter, Edit, Trash2, Eye } from "lucide-react";

export const Route = createFileRoute("/admin/students")({
  component: Students,
  head: () => ({ meta: [{ title: "Students — SmartAttend" }] }),
});

function Students() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Student Management</h1>
          <p className="text-sm text-muted-foreground">1,240 students · 1,189 face-enrolled · 51 pending enrollment</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"><Upload className="size-4" /> Bulk Upload CSV</button>
          <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Plus className="size-4" /> Add Student</button>
        </div>
      </div>

      <SectionCard>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search by roll number or name…" className="w-full h-9 pl-9 pr-3 rounded-md bg-secondary/60 outline-none text-sm focus:bg-card focus:ring-2 focus:ring-ring" />
          </div>
          {["Department: All", "Class: All", "Section: All", "Status: All", "Enrollment: All"].map((f) => (
            <button key={f} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-xs hover:bg-secondary">
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
              {students.map((s) => (
                <tr key={s.roll} className="border-t hover:bg-secondary/30">
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
                  <td className="px-5 py-3">
                    <StatusBadge status={s.enrolled ? "Active" : "Pending"} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full ${s.attendance >= 75 ? "bg-success" : s.attendance >= 60 ? "bg-warning" : "bg-destructive"}`}
                          style={{ width: `${s.attendance}%` }} />
                      </div>
                      <span className="text-xs tabular-nums">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button className="size-7 rounded grid place-items-center hover:bg-secondary"><Eye className="size-3.5" /></button>
                      <button className="size-7 rounded grid place-items-center hover:bg-secondary"><Edit className="size-3.5" /></button>
                      <button className="size-7 rounded grid place-items-center hover:bg-secondary text-destructive"><Trash2 className="size-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
