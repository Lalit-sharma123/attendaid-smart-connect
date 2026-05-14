import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/ui-kit";
import { confidenceDist, weeklyTrend, departmentAttendance } from "@/lib/mock-data";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";
import { Sparkles, AlertTriangle, TrendingDown, Camera, MapPin, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
  head: () => ({ meta: [{ title: "AI Analytics — SmartAttend" }] }),
});

const riskStudents = [
  { roll: "BCA-1024", name: "Divya Nair", risk: 88, attendance: 58 },
  { roll: "MBA-4012", name: "Anjali Singh", risk: 74, attendance: 73 },
  { roll: "BCA-1023", name: "Aman Gupta", risk: 70, attendance: 64 },
  { roll: "BBA-2099", name: "Rohan Das", risk: 65, attendance: 67 },
  { roll: "MCA-3089", name: "Tanya Roy", risk: 61, attendance: 70 },
];

function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Analytics</h1>
        <p className="text-sm text-muted-foreground">Predictive attendance, anomaly detection, and recognition quality intelligence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { icon: TrendingDown, title: "Top 10 students at attendance risk", value: "10 flagged", tone: "danger" },
          { icon: AlertTriangle, title: "Classes with declining attendance", value: "4 classes", tone: "warning" },
          { icon: Camera, title: "Cameras with low recognition quality", value: "2 cameras", tone: "warning" },
          { icon: MapPin, title: "Most common spoof attempt locations", value: "Main Gate", tone: "danger" },
          { icon: Sparkles, title: "Suggested camera angle improvements", value: "3 actions", tone: "info" },
          { icon: TrendingDown, title: "Model confidence trend (7d)", value: "+1.2%", tone: "success" },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.title} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className={`size-10 rounded-lg grid place-items-center
                  ${a.tone === "danger" ? "bg-destructive/10 text-destructive"
                  : a.tone === "warning" ? "bg-warning/20 text-warning-foreground"
                  : a.tone === "success" ? "bg-success/15 text-success"
                  : "bg-info/10 text-info"}`}>
                  <Icon className="size-5" />
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{a.title}</div>
              <div className="mt-1 text-lg font-semibold">{a.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Attendance Prediction (Next 4 Weeks)" className="xl:col-span-2">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area dataKey="predicted" stroke="var(--color-primary)" fill="url(#ag)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Low Attendance Risk Students">
          <div className="space-y-2">
            {riskStudents.map((s) => (
              <div key={s.roll} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border/60">
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{s.roll} · attendance {s.attendance}%</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-destructive tabular-nums">{s.risk}%</div>
                  <div className="text-[10px] text-muted-foreground">risk</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Recognition Confidence Distribution">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceDist} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="bucket" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="var(--color-info)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Department Attendance Ranking">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentAttendance} layout="vertical" margin={{ top: 5, right: 10, bottom: 0, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis dataKey="dept" type="category" stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="attendance" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
