import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SectionCard } from "@/components/ui-kit";
import { Cpu, HardDrive, MemoryStick, Database, Server, Activity, RefreshCw, FileDown, ScrollText } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/admin/health")({
  component: Health,
  head: () => ({ meta: [{ title: "System Health — SmartAttend" }] }),
});

const services = [
  { name: "Backend API", status: "Healthy", uptime: "99.98%", latency: "42ms" },
  { name: "PostgreSQL Database", status: "Healthy", uptime: "99.99%", latency: "8ms" },
  { name: "Redis Cache", status: "Healthy", uptime: "99.97%", latency: "2ms" },
  { name: "Face Recognition Model", status: "Healthy", uptime: "99.92%", latency: "84ms" },
  { name: "Liveness Model", status: "Degraded", uptime: "98.41%", latency: "210ms" },
  { name: "Camera Stream Service", status: "Healthy", uptime: "99.81%", latency: "92ms" },
];

const latencyData = Array.from({ length: 20 }, (_, i) => ({ t: i, ms: 70 + Math.round(Math.random() * 40) }));

function Health() {
  const [restarting, setRestarting] = useState<string | null>(null);
  const [logsFor, setLogsFor] = useState<string | null>(null);
  const [gauge, setGauge] = useState<{ label: string; value: number } | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">System Health</h1>
          <p className="text-sm text-muted-foreground">Live infrastructure monitoring and inference performance.</p>
        </div>
        <button onClick={() => toast.success("Diagnostics bundle generated")} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm"><FileDown className="size-4" /> Download Diagnostics</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Cpu, label: "CPU", value: 42 },
          { icon: MemoryStick, label: "GPU", value: 78 },
          { icon: Database, label: "RAM", value: 61 },
          { icon: HardDrive, label: "Disk", value: 34 },
        ].map((g) => {
          const Icon = g.icon;
          return (
            <button key={g.label} onClick={() => setGauge(g)} className="rounded-xl border bg-card p-5 text-left hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon className="size-4" /></div>
                <Activity className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{g.label} usage</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{g.value}%</div>
              <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full ${g.value > 80 ? "bg-destructive" : g.value > 60 ? "bg-warning" : "bg-success"}`} style={{ width: `${g.value}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Average Inference Latency" className="lg:col-span-2">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="ms" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Queue & Errors">
          <div className="space-y-3 text-sm">
            <Row label="Queue size" value="12 jobs" />
            <Row label="Throughput" value="48/sec" />
            <Row label="Error rate (1h)" value="0.04%" tone="text-success" />
            <Row label="Uptime (30d)" value="99.81%" tone="text-success" />
            <Row label="Last incident" value="2d 4h ago" />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Service Status">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((s) => (
            <div key={s.name} className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30">
              <div className="flex items-center gap-3">
                <Server className="size-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">uptime {s.uptime} · {s.latency}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setLogsFor(s.name)} className="size-7 rounded grid place-items-center hover:bg-secondary" title="View logs"><ScrollText className="size-3.5" /></button>
                <button onClick={() => setRestarting(s.name)} className="size-7 rounded grid place-items-center hover:bg-secondary" title="Restart"><RefreshCw className="size-3.5" /></button>
                <span className={`text-xs font-medium ${s.status === "Healthy" ? "text-success" : "text-warning-foreground"}`}>● {s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <ConfirmDialog open={!!restarting} onOpenChange={(o) => !o && setRestarting(null)}
        title={`Restart ${restarting}?`} description="Service may be unavailable for ~10 seconds."
        confirmLabel="Restart" destructive
        onConfirm={() => { toast.success(`${restarting} restarted`); setRestarting(null); }} />

      <Dialog open={!!logsFor} onOpenChange={(o) => !o && setLogsFor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{logsFor} · Live Logs</DialogTitle><DialogDescription>Last 50 lines</DialogDescription></DialogHeader>
          <pre className="rounded-md bg-secondary/40 p-3 text-[11px] font-mono max-h-80 overflow-y-auto">
{[...Array(20)].map((_, i) => `[09:2${i % 10}:${10 + i}] INFO  ${logsFor ?? ""} request=${1000 + i} latency=${60 + (i * 7) % 80}ms status=200`).join("\n")}
          </pre>
        </DialogContent>
      </Dialog>

      <Dialog open={!!gauge} onOpenChange={(o) => !o && setGauge(null)}>
        <DialogContent className="max-w-sm">
          {gauge && (
            <>
              <DialogHeader><DialogTitle>{gauge.label} usage · {gauge.value}%</DialogTitle><DialogDescription>Live snapshot</DialogDescription></DialogHeader>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>1m avg</span><span>{gauge.value - 4}%</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>5m avg</span><span>{gauge.value - 9}%</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Threshold</span><span>80%</span></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between text-sm py-2 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium tabular-nums ${tone ?? ""}`}>{value}</span>
    </div>
  );
}
