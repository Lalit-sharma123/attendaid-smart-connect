import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/ui-kit";
import { Download, FileSpreadsheet, FileText, Printer, Mail, Calendar, BookOpen, User, AlertOctagon, ShieldAlert, Camera } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: Reports,
  head: () => ({ meta: [{ title: "Reports & Export — SmartAttend" }] }),
});

const reports = [
  { title: "Daily Attendance Report", icon: Calendar, desc: "All check-ins for today across departments." },
  { title: "Monthly Attendance Report", icon: Calendar, desc: "Aggregated monthly attendance per class." },
  { title: "Class Attendance Report", icon: BookOpen, desc: "Per-class attendance breakdown with charts." },
  { title: "Student Attendance History", icon: User, desc: "Complete attendance history of one student." },
  { title: "Low Attendance Risk Report", icon: AlertOctagon, desc: "Students predicted to drop below 75%." },
  { title: "Spoof Attempt Report", icon: ShieldAlert, desc: "All blocked spoof / liveness incidents." },
  { title: "Camera Activity Report", icon: Camera, desc: "Per-camera FPS, latency, and detection counts." },
];

function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports &amp; Export</h1>
          <p className="text-sm text-muted-foreground">Generate, schedule, and download attendance reports in any format.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm"><FileSpreadsheet className="size-4" /> Excel</button>
          <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm"><FileText className="size-4" /> PDF</button>
          <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm"><Download className="size-4" /> CSV</button>
          <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm"><Printer className="size-4" /> Print</button>
          <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Mail className="size-4" /> Schedule Email</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.title} className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3">
                <Icon className="size-5" />
              </div>
              <div className="font-semibold">{r.title}</div>
              <div className="text-xs text-muted-foreground mt-1 mb-4">{r.desc}</div>
              <div className="flex gap-2">
                <button className="flex-1 h-8 rounded-md bg-secondary text-xs hover:bg-accent">Preview</button>
                <button className="flex-1 h-8 rounded-md bg-primary text-primary-foreground text-xs">Generate</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <SectionCard title="Report Preview · Daily Attendance · 14 May 2026">
          <div className="rounded-lg border bg-secondary/20 p-6 min-h-[400px]">
            <div className="border-b pb-3 mb-4">
              <div className="text-xs text-muted-foreground">SmartAttend University · Confidential</div>
              <div className="text-lg font-semibold">Daily Attendance Report</div>
              <div className="text-xs text-muted-foreground">14 May 2026 · Generated 09:24 AM IST</div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded bg-card border"><div className="text-muted-foreground">Total</div><div className="text-xl font-semibold">1,240</div></div>
              <div className="p-3 rounded bg-card border"><div className="text-muted-foreground">Present</div><div className="text-xl font-semibold text-success">1,078</div></div>
              <div className="p-3 rounded bg-card border"><div className="text-muted-foreground">Absent</div><div className="text-xl font-semibold text-destructive">162</div></div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">Detailed roster, charts, and incident summary follow…</div>
          </div>
        </SectionCard>

        <SectionCard title="Export Options">
          <div className="space-y-3 text-sm">
            <Field label="Date Range" value="14 May 2026 → 14 May 2026" />
            <Field label="Department" value="All" />
            <Field label="Class" value="All" />
            <Field label="Section" value="All" />
            <div>
              <div className="text-xs text-muted-foreground mb-1.5">Include Columns</div>
              <div className="flex flex-wrap gap-1.5">
                {["Roll", "Name", "Time", "Status", "Confidence", "Liveness", "Camera", "Edit Reason"].map((c) => (
                  <span key={c} className="text-[11px] px-2 py-1 rounded bg-primary/10 text-primary">{c}</span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border p-3 bg-secondary/30 text-xs">
              <div className="flex justify-between mb-1"><span>Export progress</span><span className="tabular-nums">68%</span></div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary" style={{ width: "68%" }} /></div>
            </div>
            <button className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium">Export Report</button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-xs py-2 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
