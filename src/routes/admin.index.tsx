import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users, UserCheck, UserX, Clock, Camera, ShieldAlert, EyeOff,
  TrendingUp, Brain, Activity, Sparkles, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { toast } from "sonner";
import { StatCard, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  dailyAttendance, weeklyTrend, departmentAttendance,
  spoofAttempts, cameraHealth, aiInsights, heatmap, attendanceRecords,
} from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Admin Dashboard — SmartAttend" }] }),
});

const insightDetails: Record<string, { confidence: number; related: string; action: string }> = {
  warning: { confidence: 78, related: "BCA Section B · 41 students", action: "Send teacher reminder + parent SMS" },
  danger: { confidence: 92, related: "Camera 3 · Lab Block · 13 events", action: "Review camera feed and escalate" },
  info: { confidence: 84, related: "5 students across BCA, MBA, MCA", action: "Notify class mentors" },
};

function Dashboard() {
  const navigate = useNavigate();
  const [insight, setInsight] = useState<{ tone: string; text: string } | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const [chartDetail, setChartDetail] = useState<{ title: string; body: string } | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time AI attendance monitoring across 14 cameras and 1,240 students.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {["Today", "7d", "30d", "Custom"].map((p, i) => (
            <button key={p} onClick={() => toast(`Range: ${p}`)} className={`px-2.5 py-1 rounded-md ${i === 0 ? "bg-secondary" : "hover:bg-secondary"}`}>{p}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard to="/admin/students" label="Total Students" value="1,240" sub="+24 this month" icon={<Users className="size-5" />} />
        <StatCard to="/admin/attendance?status=Present" label="Present Today" value="1,078" sub="86.9% of roster" tone="success" icon={<UserCheck className="size-5" />} />
        <StatCard to="/admin/attendance?status=Absent" label="Absent Today" value="162" sub="13.1% of roster" tone="danger" icon={<UserX className="size-5" />} />
        <StatCard to="/admin/attendance?status=Late" label="Late Students" value="48" sub="−12 vs yesterday" tone="warning" icon={<Clock className="size-5" />} />
        <StatCard to="/admin/cameras" label="Active Cameras" value="12 / 14" sub="2 offline · maintenance" tone="info" icon={<Camera className="size-5" />} />
        <StatCard to="/admin/alerts?type=Spoof" label="Spoof Attempts" value="7" sub="3 critical · 4 medium" tone="danger" icon={<ShieldAlert className="size-5" />} />
        <StatCard to="/admin/alerts?type=Unknown" label="Unknown Faces" value="13" sub="Needs review" tone="warning" icon={<EyeOff className="size-5" />} />
        <StatCard to="/admin/analytics" label="Avg Attendance" value="86.9%" sub="+1.4 WoW" tone="success" icon={<TrendingUp className="size-5" />} />
        <StatCard onClick={() => setAiOpen(true)} label="AI Confidence" value="92.4%" sub="ArcFace R100" icon={<Brain className="size-5" />} />
        <StatCard onClick={() => setHealthOpen(true)} label="System Uptime" value="99.8%" sub="30-day" tone="success" icon={<Activity className="size-5" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Weekly Attendance Trend (Predicted vs Actual)" className="xl:col-span-2"
          action={<span className="text-xs text-muted-foreground">AI forecast · 7 weeks</span>}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                onClick={(e: any) => { if (e?.activePayload?.[0]) { const p = e.activePayload[0].payload; setChartDetail({ title: `Week ${p.week}`, body: `Actual ${p.attendance}% · Predicted ${p.predicted}%` }); } }}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-info)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="attendance" stroke="var(--color-primary)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="predicted" stroke="var(--color-info)" fill="url(#g2)" strokeWidth={2} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="AI Insights" action={<Sparkles className="size-4 text-primary" />}>
          <div className="space-y-3">
            {aiInsights.map((i, idx) => (
              <button key={idx} type="button" onClick={() => setInsight(i)}
                className="w-full flex gap-3 p-3 rounded-lg bg-secondary/50 border border-border/60 text-left hover:bg-secondary/80 hover:border-primary/40 transition-colors">
                <div className={`mt-0.5 size-2 rounded-full ${i.tone === "danger" ? "bg-destructive" : i.tone === "warning" ? "bg-warning" : "bg-info"}`} />
                <div className="text-xs leading-relaxed">{i.text}</div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Daily Attendance %">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyAttendance} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                onClick={(e: any) => { if (e?.activePayload?.[0]) { const p = e.activePayload[0].payload; setChartDetail({ title: p.day, body: `Attendance ${p.pct}% · ${p.late} late check-ins` }); } }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="pct" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Department-wise Attendance">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentAttendance} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                onClick={(e: any) => { if (e?.activePayload?.[0]) { const p = e.activePayload[0].payload; navigate({ to: "/admin/attendance", search: { dept: p.dept } as any }); } }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="dept" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="attendance" fill="var(--color-primary)" radius={[6, 6, 0, 0]} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Camera Health" to="/admin/cameras">
          <div className="h-[220px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cameraHealth} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {cameraHealth.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Spoof Attempts (Today)" to="/admin/alerts" className="lg:col-span-1">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spoofAttempts} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Class-wise Attendance Heatmap" to="/admin/analytics" className="lg:col-span-2">
          <div className="space-y-1.5">
            {heatmap.map((row, ri) => (
              <div key={ri} className="flex items-center gap-1.5">
                <div className="w-12 text-[11px] text-muted-foreground">Sec {String.fromCharCode(65 + ri)}</div>
                {row.map((cell) => {
                  const intensity = cell.v / 100;
                  return (
                    <div
                      key={`${ri}-${cell.c}`}
                      className="flex-1 h-7 rounded-md grid place-items-center text-[10px] font-medium tabular-nums"
                      style={{
                        background: `color-mix(in oklab, var(--color-primary) ${intensity * 80}%, var(--color-secondary))`,
                        color: intensity > 0.6 ? "white" : "var(--color-foreground)",
                      }}
                    >
                      {cell.v}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="flex items-center gap-1.5 pt-2">
              <div className="w-12" />
              {["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"].map((p) => (
                <div key={p} className="flex-1 text-center text-[10px] text-muted-foreground">{p}</div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent Attendance Activity" action={
        <button onClick={() => navigate({ to: "/admin/attendance" })} className="text-xs text-primary inline-flex items-center gap-1">View all <ArrowUpRight className="size-3" /></button>
      }>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-secondary/30">
              <tr className="text-left">
                <th className="px-5 py-2.5 font-medium">Roll No</th>
                <th className="px-5 py-2.5 font-medium">Student</th>
                <th className="px-5 py-2.5 font-medium">Time</th>
                <th className="px-5 py-2.5 font-medium">Camera</th>
                <th className="px-5 py-2.5 font-medium">Confidence</th>
                <th className="px-5 py-2.5 font-medium">Liveness</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.slice(0, 6).map((r) => (
                <tr key={r.roll + r.time} onClick={() => navigate({ to: "/admin/attendance" })}
                  className="border-t hover:bg-secondary/30 cursor-pointer">
                  <td className="px-5 py-3 font-mono text-xs">{r.roll}</td>
                  <td className="px-5 py-3 font-medium">{r.name}</td>
                  <td className="px-5 py-3 tabular-nums">{r.time}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.camera}</td>
                  <td className="px-5 py-3 tabular-nums">{r.confidence}%</td>
                  <td className="px-5 py-3 tabular-nums">{r.liveness}%</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* AI Insight modal */}
      <Dialog open={!!insight} onOpenChange={(o) => !o && setInsight(null)}>
        <DialogContent className="max-w-md">
          {insight && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> AI Insight</DialogTitle>
                <DialogDescription>{insight.text}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span className="text-muted-foreground">Confidence</span><span className="font-semibold">{insightDetails[insight.tone].confidence}%</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span className="text-muted-foreground">Related</span><span className="font-medium text-right">{insightDetails[insight.tone].related}</span></div>
                <div className="p-3 rounded-md border bg-info/5 text-xs"><strong>Recommended action:</strong> {insightDetails[insight.tone].action}</div>
              </div>
              <DialogFooter className="gap-2">
                <button onClick={() => { setInsight(null); navigate({ to: "/admin/analytics" }); }} className="h-9 px-3 rounded-md border text-sm">View Data</button>
                <button onClick={() => { toast.success("Insight marked reviewed"); setInsight(null); }} className="h-9 px-3 rounded-md bg-secondary text-sm">Mark Reviewed</button>
                <button onClick={() => { toast.success("Alert created from insight"); setInsight(null); navigate({ to: "/admin/alerts" }); }} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm">Create Alert</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* AI confidence modal */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>AI Recognition Confidence</DialogTitle>
            <DialogDescription>Average over last 24h across all cameras</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Active model</span><span className="font-medium">ArcFace R100</span></div>
            <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Avg confidence</span><span className="font-semibold text-success">92.4%</span></div>
            <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Avg liveness</span><span className="font-semibold text-success">88.1%</span></div>
            <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Threshold</span><span className="font-medium">≥ 78%</span></div>
          </div>
          <DialogFooter>
            <button onClick={() => { setAiOpen(false); navigate({ to: "/admin/analytics" }); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Open AI Analytics</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* System uptime modal */}
      <Dialog open={healthOpen} onOpenChange={setHealthOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>System Uptime · 99.8%</DialogTitle>
            <DialogDescription>30-day rolling availability</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Last incident</span><span>2d 4h ago</span></div>
            <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Mean time to recover</span><span>4m 12s</span></div>
            <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Backups</span><span className="text-success">Healthy · 02:00 AM</span></div>
          </div>
          <DialogFooter>
            <button onClick={() => { setHealthOpen(false); navigate({ to: "/admin/health" }); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Open System Health</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generic chart-detail modal */}
      <Dialog open={!!chartDetail} onOpenChange={(o) => !o && setChartDetail(null)}>
        <DialogContent className="max-w-sm">
          {chartDetail && (
            <>
              <DialogHeader>
                <DialogTitle>{chartDetail.title}</DialogTitle>
                <DialogDescription>{chartDetail.body}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button onClick={() => { setChartDetail(null); navigate({ to: "/admin/attendance" }); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">View related records</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
