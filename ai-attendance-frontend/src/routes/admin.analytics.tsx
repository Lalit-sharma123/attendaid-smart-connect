import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SectionCard } from "@/components/ui-kit";
import { confidenceDist, weeklyTrend, departmentAttendance } from "@/lib/mock-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";
import { Sparkles, AlertTriangle, TrendingDown, Camera, MapPin, ArrowUpRight, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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

const recommendations = [
  { icon: TrendingDown, title: "Top 10 students at attendance risk", value: "10 flagged", tone: "danger", detail: "Send mentor notifications and parent SMS." },
  { icon: AlertTriangle, title: "Classes with declining attendance", value: "4 classes", tone: "warning", detail: "Schedule remedial sessions for BBA-2A, MBA-1B." },
  { icon: Camera, title: "Cameras with low recognition quality", value: "2 cameras", tone: "warning", detail: "Recalibrate Library and Auditorium cameras." },
  { icon: MapPin, title: "Most common spoof attempt locations", value: "Main Gate", tone: "danger", detail: "Add additional camera angle and supervisor presence." },
  { icon: Sparkles, title: "Suggested camera angle improvements", value: "3 actions", tone: "info", detail: "Tilt CAM-03 by -8°, CAM-06 by +5°, CAM-09 +3°." },
  { icon: TrendingDown, title: "Model confidence trend (7d)", value: "+1.2%", tone: "success", detail: "Re-training improved confidence by 1.2pp." },
];

function Analytics() {
  const navigate = useNavigate();
  const [openRec, setOpenRec] = useState<typeof recommendations[number] | null>(null);
  const [aiSummary, setAiSummary] = useState(false);
  const [openRisk, setOpenRisk] = useState<typeof riskStudents[number] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Analytics</h1>
          <p className="text-sm text-muted-foreground">Predictive attendance, anomaly detection, and recognition quality intelligence.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAiSummary(true)} className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Sparkles className="size-4" /> Generate AI Summary</button>
          <button onClick={() => toast.success("AI report exported")} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm"><FileDown className="size-4" /> Export AI Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {recommendations.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.title} onClick={() => setOpenRec(a)} className="rounded-xl border bg-card p-5 text-left hover:shadow-md hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between">
                <div className={`size-10 rounded-lg grid place-items-center
                  ${a.tone === "danger" ? "bg-destructive/10 text-destructive"
                  : a.tone === "warning" ? "bg-warning/20 text-warning-foreground"
                  : a.tone === "success" ? "bg-success/15 text-success"
                  : "bg-info/10 text-info"}`}><Icon className="size-5" /></div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{a.title}</div>
              <div className="mt-1 text-lg font-semibold">{a.value}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Attendance Prediction (Next 4 Weeks)" className="xl:col-span-2">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs><linearGradient id="ag" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient></defs>
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
              <button key={s.roll} onClick={() => setOpenRisk(s)} className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border/60 hover:bg-secondary text-left">
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{s.roll} · attendance {s.attendance}%</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-destructive tabular-nums">{s.risk}%</div>
                  <div className="text-[10px] text-muted-foreground">risk</div>
                </div>
              </button>
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

      <Dialog open={!!openRec} onOpenChange={(o) => !o && setOpenRec(null)}>
        <DialogContent className="max-w-md">
          {openRec && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> {openRec.title}</DialogTitle><DialogDescription>{openRec.value}</DialogDescription></DialogHeader>
              <div className="text-sm p-3 rounded-md border bg-info/5">{openRec.detail}</div>
              <DialogFooter>
                <button onClick={() => { toast.success("Alert created from insight"); setOpenRec(null); navigate({ to: "/admin/alerts" }); }} className="h-9 px-3 rounded-md border text-sm">Create Alert</button>
                <button onClick={() => { toast.success("Marked reviewed"); setOpenRec(null); }} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm">Mark Reviewed</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={aiSummary} onOpenChange={setAiSummary}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> AI Summary</DialogTitle><DialogDescription>Generated for last 7 days</DialogDescription></DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="leading-relaxed">Overall attendance held at <strong>86.9%</strong>, +1.4 pp WoW. Predictive model anticipates a <strong>~8% drop</strong> in BCA Section B tomorrow. Recognition confidence trended upward (+1.2 pp) after weekly retraining. Spoof attempts concentrated at <strong>Main Gate</strong> (+220%); recommend additional supervisor coverage during peak entry.</p>
            <p className="leading-relaxed">Top action: notify mentors of the 10 risk-flagged students; recalibrate Library and Auditorium cameras (low recognition quality).</p>
          </div>
          <DialogFooter>
            <button onClick={() => { toast.success("AI summary exported"); setAiSummary(false); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Export Summary</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!openRisk} onOpenChange={(o) => !o && setOpenRisk(null)}>
        <DialogContent className="max-w-sm">
          {openRisk && (
            <>
              <DialogHeader><DialogTitle>{openRisk.name}</DialogTitle><DialogDescription className="font-mono">{openRisk.roll}</DialogDescription></DialogHeader>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Current attendance</span><span>{openRisk.attendance}%</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Predicted risk</span><span className="text-destructive font-semibold">{openRisk.risk}%</span></div>
              </div>
              <DialogFooter>
                <button onClick={() => { setOpenRisk(null); navigate({ to: "/admin/students" }); }} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm">View Profile</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
