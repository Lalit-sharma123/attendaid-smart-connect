import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/ui-kit";
import { Cpu, HardDrive, MemoryStick, Database, Server, Activity } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

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

const latencyData = Array.from({ length: 20 }, (_, i) => ({ t: i, ms: 70 + Math.random() * 40 }));

function Health() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Health</h1>
        <p className="text-sm text-muted-foreground">Live infrastructure monitoring and inference performance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Gauge icon={Cpu} label="CPU" value={42} />
        <Gauge icon={MemoryStick} label="GPU" value={78} />
        <Gauge icon={Database} label="RAM" value={61} />
        <Gauge icon={HardDrive} label="Disk" value={34} />
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
              <span className={`text-xs font-medium ${s.status === "Healthy" ? "text-success" : "text-warning-foreground"}`}>● {s.status}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function Gauge({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon className="size-4" /></div>
        <Activity className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{label} usage</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}%</div>
      <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full ${value > 80 ? "bg-destructive" : value > 60 ? "bg-warning" : "bg-success"}`} style={{ width: `${value}%` }} />
      </div>
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
