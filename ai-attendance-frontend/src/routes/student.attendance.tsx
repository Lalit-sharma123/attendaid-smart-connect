import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SectionCard } from "@/components/ui-kit";
import { monthlyCalendar, studentSubjects } from "@/lib/mock-data";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";

export const Route = createFileRoute("/student/attendance")({
  component: MyAttendance,
  head: () => ({ meta: [{ title: "My Attendance — SmartAttend" }] }),
});

const trend = Array.from({ length: 12 }, (_, i) => ({ m: ["J","F","M","A","M","J","J","A","S","O","N","D"][i], pct: 70 + ((i * 7) % 25) }));

function MyAttendance() {
  const [month, setMonth] = useState("May 2026");
  const [subject, setSubject] = useState("All");

  const filteredSubjects = subject === "All" ? studentSubjects : studentSubjects.filter((s) => s.subject === subject);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Attendance</h1>
          <p className="text-sm text-muted-foreground">Personal attendance history and class breakdown.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 px-3 rounded-md border text-sm bg-card">
            {["May 2026", "Apr 2026", "Mar 2026"].map((m) => <option key={m}>{m}</option>)}
          </select>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="h-9 px-3 rounded-md border text-sm bg-card">
            <option>All</option>
            {studentSubjects.map((s) => <option key={s.subject}>{s.subject}</option>)}
          </select>
          <button onClick={() => { downloadCSV("my-attendance.csv", studentSubjects); toast.success("Report downloaded"); }} className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Download className="size-4" /> Download Report</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Overall Attendance" value="86%" tone="text-success" />
        <Card label="Present Days" value="124" />
        <Card label="Absent Days" value="14" tone="text-destructive" />
        <Card label="Late Days" value="6" tone="text-warning-foreground" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
        <SectionCard title={month}>
          <div className="grid grid-cols-7 gap-1.5 text-xs">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} className="text-center text-muted-foreground py-1">{d}</div>
            ))}
            {monthlyCalendar.map((d) => {
              const cls =
                d.status === "present" ? "bg-success/15 text-success border-success/30"
                : d.status === "absent" ? "bg-destructive/15 text-destructive border-destructive/30"
                : d.status === "late" ? "bg-warning/20 text-warning-foreground border-warning/40"
                : d.status === "holiday" ? "bg-secondary text-muted-foreground"
                : "bg-secondary/30 text-muted-foreground/40";
              return (
                <button key={d.day} onClick={() => toast(`Day ${d.day} · ${d.status}`)}
                  className={`aspect-square rounded-md border grid place-items-center font-medium tabular-nums ${cls}`}>
                  {d.day}
                </button>
              );
            })}
          </div>
          <div className="flex gap-4 text-xs mt-4 text-muted-foreground">
            <span>● <span className="text-success">Present</span></span>
            <span>● <span className="text-destructive">Absent</span></span>
            <span>● <span className="text-warning-foreground">Late</span></span>
            <span>● Holiday</span>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Attendance Trend">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="pct" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 flex gap-3">
            <AlertTriangle className="size-5 text-warning-foreground shrink-0" />
            <div className="text-xs">
              <div className="font-medium">Computer Networks attendance is below 75%.</div>
              You need to attend the next 4 classes to recover.
            </div>
          </div>
        </div>
      </div>

      <SectionCard title="Subject-wise Attendance">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="text-left border-b">
              <th className="py-2 font-medium">Subject</th>
              <th className="py-2 font-medium">Attended</th>
              <th className="py-2 font-medium">Total</th>
              <th className="py-2 font-medium">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map((s) => (
              <tr key={s.subject} className="border-b last:border-0">
                <td className="py-3 font-medium">{s.subject}</td>
                <td className="py-3 tabular-nums">{s.attended}</td>
                <td className="py-3 tabular-nums">{s.total}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2 max-w-xs">
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full ${s.pct >= 75 ? "bg-success" : "bg-destructive"}`} style={{ width: `${s.pct}%` }} />
                    </div>
                    <span className="text-xs tabular-nums w-10 text-right">{s.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-2 text-3xl font-semibold tabular-nums ${tone ?? ""}`}>{value}</div>
    </div>
  );
}
