import { createFileRoute } from "@tanstack/react-router";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { attendanceRecords } from "@/lib/mock-data";
import { Search, Filter, Download, Edit3, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/attendance")({
  component: Attendance,
  head: () => ({ meta: [{ title: "Attendance Records — SmartAttend" }] }),
});

function Attendance() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance Records</h1>
          <p className="text-sm text-muted-foreground">Filter, audit, and export attendance with full chain-of-custody.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"><Download className="size-4" /> Export CSV</button>
          <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Download className="size-4" /> Export PDF</button>
        </div>
      </div>

      <SectionCard>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search name or roll number…" className="w-full h-9 pl-9 pr-3 rounded-md bg-secondary/60 outline-none text-sm" />
          </div>
          {["Date: Today", "Class: All", "Section: All", "Department: All", "Status: All", "Camera: All", "Confidence ≥70%", "Liveness ≥60%"].map((f) => (
            <button key={f} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border text-xs hover:bg-secondary">
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
              {[...attendanceRecords, ...attendanceRecords].map((r, i) => (
                <tr key={i} className="border-t hover:bg-secondary/30">
                  <td className="px-3 py-3"><input type="checkbox" /></td>
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
                  <td className="px-3 py-3 text-right">
                    <button className="inline-flex items-center gap-1 text-xs text-primary"><Edit3 className="size-3" /> Correct</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div>Showing 1–16 of 1,078 records</div>
          <div className="flex items-center gap-1">
            <button className="size-7 rounded grid place-items-center border"><ChevronLeft className="size-3.5" /></button>
            {[1, 2, 3, "…", 67].map((p, i) => (
              <button key={i} className={`size-7 rounded text-xs ${p === 1 ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{p}</button>
            ))}
            <button className="size-7 rounded grid place-items-center border"><ChevronRight className="size-3.5" /></button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
