import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import {
  correctAttendanceApi,
  getAttendanceRecordsApi,
} from "@/services/attendanceApi";
import { Search, RefreshCw, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/attendance")({
  component: Attendance,
  head: () => ({ meta: [{ title: "Attendance — SmartAttend" }] }),
});

type UiRecord = {
  id: string;
  student: string;
  roll: string;
  department: string;
  cls: string;
  section: string;
  status: string;
  source: string;
  time: string;
  confidence: number;
};

function mapRecord(r: any): UiRecord {
  return {
    id: r.id,
    student: r.student?.name || r.studentName || "-",
    roll: r.student?.rollNo || r.student?.roll_no || r.rollNo || "-",
    department: r.department?.name || r.student?.department?.name || "-",
    cls: r.courseClass?.name || r.class?.name || r.student?.courseClass?.name || "-",
    section: r.section?.name || r.student?.section?.name || "-",
    status: r.status || "-",
    source: r.source || r.markedBy || "SYSTEM",
    time: r.markedAt || r.createdAt || "-",
    confidence: Number(r.confidenceScore || r.confidence || 0),
  };
}

function Attendance() {
  const [list, setList] = useState<UiRecord[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<UiRecord | null>(null);
  const [correction, setCorrection] = useState({
    status: "PRESENT",
    reason: "",
  });

  async function loadRecords() {
    setLoading(true);

    try {
      const data = await getAttendanceRecordsApi();
      const rows = Array.isArray(data) ? data : data?.items || [];
      setList(rows.map(mapRecord));
    } catch (error: any) {
      toast.error(error.message || "Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;

    return list.filter((r) =>
      [r.student, r.roll, r.department, r.cls, r.section, r.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [list, q]);

  async function handleCorrection() {
    if (!editing) return;

    if (!correction.reason.trim()) {
      toast.error("Correction reason required");
      return;
    }

    try {
      await correctAttendanceApi(editing.id, correction);
      await loadRecords();
      toast.success("Attendance corrected");
      setEditing(null);
      setCorrection({ status: "PRESENT", reason: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to correct attendance");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance Records</h1>
          <p className="text-sm text-muted-foreground">
            Real attendance records from backend{loading ? " · loading..." : ""}
          </p>
        </div>

        <button
          onClick={loadRecords}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"
        >
          <RefreshCw className="size-4" /> Refresh
        </button>
      </div>

      <SectionCard>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by student, roll, class, status..."
            className="w-full h-9 pl-9 pr-3 rounded-md bg-secondary/60 outline-none text-sm focus:bg-card focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-secondary/30">
              <tr className="text-left">
                <th className="px-5 py-2.5 font-medium">Student</th>
                <th className="px-5 py-2.5 font-medium">Roll No</th>
                <th className="px-5 py-2.5 font-medium">Department</th>
                <th className="px-5 py-2.5 font-medium">Class</th>
                <th className="px-5 py-2.5 font-medium">Section</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Source</th>
                <th className="px-5 py-2.5 font-medium">Time</th>
                <th className="px-5 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t hover:bg-secondary/30">
                  <td className="px-5 py-3 font-medium">{r.student}</td>
                  <td className="px-5 py-3 font-mono text-xs">{r.roll}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.department}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.cls}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.section}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{r.source}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{r.time}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditing(r);
                        setCorrection({ status: r.status || "PRESENT", reason: "" });
                      }}
                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md bg-secondary text-xs"
                    >
                      <Edit className="size-3" /> Correct
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-8 text-center text-sm text-muted-foreground"
                  >
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>Correct Attendance</DialogTitle>
                <DialogDescription>
                  {editing.student} · {editing.roll}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <select
                  value={correction.status}
                  onChange={(e) =>
                    setCorrection({ ...correction, status: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-md border bg-card"
                >
                  {["PRESENT", "ABSENT", "LATE", "EXCUSED"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>

                <textarea
                  value={correction.reason}
                  onChange={(e) =>
                    setCorrection({ ...correction, reason: e.target.value })
                  }
                  placeholder="Reason for correction"
                  className="w-full min-h-24 px-3 py-2 rounded-md border bg-card outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <DialogFooter>
                <button
                  onClick={() => setEditing(null)}
                  className="h-9 px-4 rounded-md border text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCorrection}
                  className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm"
                >
                  Save Correction
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
