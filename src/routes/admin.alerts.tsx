import { createFileRoute } from "@tanstack/react-router";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { incidents } from "@/lib/mock-data";
import { Eye, CheckCircle2, UserPlus, FileDown } from "lucide-react";

export const Route = createFileRoute("/admin/alerts")({
  component: Alerts,
  head: () => ({ meta: [{ title: "Alerts & Incidents — SmartAttend" }] }),
});

function Alerts() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alerts &amp; Incidents</h1>
          <p className="text-sm text-muted-foreground">Spoof attempts, unknown faces, camera offline, and other security events.</p>
        </div>
        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm"><FileDown className="size-4" /> Export Incident Report</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Critical" value="3" tone="bg-destructive/10 text-destructive" />
        <Stat label="High" value="6" tone="bg-destructive/10 text-destructive" />
        <Stat label="Medium" value="12" tone="bg-warning/20 text-warning-foreground" />
        <Stat label="Resolved (24h)" value="28" tone="bg-success/15 text-success" />
      </div>

      <SectionCard title="Incident Timeline">
        <div className="space-y-3">
          {incidents.map((i) => (
            <div key={i.id} className="flex items-start gap-4 p-4 rounded-lg border bg-secondary/20">
              <div className="text-xs text-muted-foreground tabular-nums w-16 pt-0.5">{i.time}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{i.type}</span>
                  <span className="text-xs font-mono text-muted-foreground">{i.id}</span>
                  <StatusBadge status={i.severity} />
                  <StatusBadge status={i.status} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{i.camera} · {i.detail}</div>
              </div>
              <div className="flex gap-1.5">
                <button className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md bg-secondary text-xs"><Eye className="size-3" /> Evidence</button>
                <button className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md bg-secondary text-xs"><UserPlus className="size-3" /> Assign</button>
                <button className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md bg-success/15 text-success text-xs"><CheckCircle2 className="size-3" /> Resolve</button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${tone}`}>{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
