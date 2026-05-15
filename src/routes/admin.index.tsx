import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users, UserCheck, UserX, Clock, Camera, ShieldAlert, EyeOff,
  TrendingUp, Brain, Activity, Sparkles, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { StatCard, SectionCard, StatusBadge } from "@/components/ui-kit";
import {
  stats, dailyAttendance, weeklyTrend, departmentAttendance,
  spoofAttempts, cameraHealth, aiInsights, heatmap, attendanceRecords,
} from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Admin Dashboard — SmartAttend" }] }),
});

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time AI attendance monitoring across 14 cameras and 1,240 students.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-secondary">Today</span>
          <span className="px-2.5 py-1 rounded-md hover:bg-secondary cursor-pointer">7d</span>
          <span className="px-2.5 py-1 rounded-md hover:bg-secondary cursor-pointer">30d</span>
          <span className="px-2.5 py-1 rounded-md hover:bg-secondary cursor-pointer">Custom</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard to="/admin/students" label="Total Students" value="1,240" sub="+24 this month" icon={<Users className="size-5" />} />
        <StatCard to="/admin/attendance" label="Present Today" value="1,078" sub="86.9% of roster" tone="success" icon={<UserCheck className="size-5" />} />
        <StatCard to="/admin/attendance" label="Absent Today" value="162" sub="13.1% of roster" tone="danger" icon={<UserX className="size-5" />} />
        <StatCard to="/admin/attendance" label="Late Students" value="48" sub="−12 vs yesterday" tone="warning" icon={<Clock className="size-5" />} />
        <StatCard to="/admin/cameras" label="Active Cameras" value="12 / 14" sub="2 offline · maintenance" tone="info" icon={<Camera className="size-5" />} />
        <StatCard to="/admin/alerts" label="Spoof Attempts" value="7" sub="3 critical · 4 medium" tone="danger" icon={<ShieldAlert className="size-5" />} />
        <StatCard to="/admin/alerts" label="Unknown Faces" value="13" sub="Needs review" tone="warning" icon={<EyeOff className="size-5" />} />
        <StatCard to="/admin/analytics" label="Avg Attendance" value="86.9%" sub="+1.4 WoW" tone="success" icon={<TrendingUp className="size-5" />} />
        <StatCard to="/admin/analytics" label="AI Confidence" value="92.4%" sub="ArcFace R100" icon={<Brain className="size-5" />} />
        <StatCard to="/admin/health" label="System Uptime" value="99.8%" sub="30-day" tone="success" icon={<Activity className="size-5" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard to="/admin/analytics" title="Weekly Attendance Trend (Predicted vs Actual)" className="xl:col-span-2"
          action={<Link to="/admin/analytics" className="text-xs text-muted-foreground hover:text-primary">AI forecast · 7 weeks</Link>}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
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

        <SectionCard to="/admin/analytics" title="AI Insights" action={<Sparkles className="size-4 text-primary" />}>
          <div className="space-y-3">
            {aiInsights.map((i, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-lg bg-secondary/50 border border-border/60">
                <div className={`mt-0.5 size-2 rounded-full ${i.tone === "danger" ? "bg-destructive" : i.tone === "warning" ? "bg-warning" : "bg-info"}`} />
                <div className="text-xs leading-relaxed">{i.text}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard to="/admin/analytics" title="Daily Attendance %">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyAttendance} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="pct" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard to="/admin/analytics" title="Department-wise Attendance">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentAttendance} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="dept" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="attendance" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Camera Health">
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
        <SectionCard title="Spoof Attempts (Today)" className="lg:col-span-1">
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

        <SectionCard title="Class-wise Attendance Heatmap" className="lg:col-span-2">
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
        <a className="text-xs text-primary inline-flex items-center gap-1">View all <ArrowUpRight className="size-3" /></a>
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
                <tr key={r.roll + r.time} className="border-t hover:bg-secondary/30">
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
    </div>
  );
}
