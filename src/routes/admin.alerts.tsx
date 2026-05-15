import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { incidents as initial } from "@/lib/mock-data";
import { Eye, CheckCircle2, UserPlus, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { downloadCSV } from "@/lib/csv";

export const Route = createFileRoute("/admin/alerts")({
  component: Alerts,
  head: () => ({ meta: [{ title: "Alerts & Incidents — SmartAttend" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ type: typeof s.type === "string" ? s.type : undefined }),
});

const admins = ["Dr. A. Mehra", "Prof. R. Iyer", "Ms. S. Kapoor"];

function Alerts() {
  const search = Route.useSearch();
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState<string>(search.type ?? "All");
  const [evidence, setEvidence] = useState<typeof initial[number] | null>(null);
  const [assigning, setAssigning] = useState<typeof initial[number] | null>(null);

  const filtered = useMemo(() => filter === "All" ? list : list.filter((i) => i.type.toLowerCase().includes(filter.toLowerCase())), [list, filter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alerts &amp; Incidents</h1>
          <p className="text-sm text-muted-foreground">Spoof attempts, unknown faces, camera offline, and other security events.</p>
        </div>
        <button onClick={() => { downloadCSV(`incidents-${Date.now()}.csv`, list); toast.success("Incident report exported"); }} className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm"><FileDown className="size-4" /> Export Incident Report</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", "Spoof", "Unknown", "Camera"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`h-8 px-3 rounded-md text-xs ${filter === f ? "bg-primary text-primary-foreground" : "border hover:bg-secondary"}`}>{f}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Critical" value={String(list.filter((i) => i.severity === "Critical").length)} tone="bg-destructive/10 text-destructive" />
        <Stat label="High" value={String(list.filter((i) => i.severity === "High").length)} tone="bg-destructive/10 text-destructive" />
        <Stat label="Medium" value={String(list.filter((i) => i.severity === "Medium").length)} tone="bg-warning/20 text-warning-foreground" />
        <Stat label="Resolved" value={String(list.filter((i) => i.status === "Resolved").length)} tone="bg-success/15 text-success" />
      </div>

      <SectionCard title="Incident Timeline">
        <div className="space-y-3">
          {filtered.map((i) => (
            <div key={i.id} onClick={() => setEvidence(i)} className="flex items-start gap-4 p-4 rounded-lg border bg-secondary/20 cursor-pointer hover:bg-secondary/40">
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
              <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setEvidence(i)} className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md bg-secondary text-xs"><Eye className="size-3" /> Evidence</button>
                <button onClick={() => setAssigning(i)} className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md bg-secondary text-xs"><UserPlus className="size-3" /> Assign</button>
                <button onClick={() => { setList((p) => p.map((x) => x.id === i.id ? { ...x, status: "Resolved" } : x)); toast.success("Marked resolved"); }} className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md bg-success/15 text-success text-xs"><CheckCircle2 className="size-3" /> Resolve</button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <Dialog open={!!evidence} onOpenChange={(o) => !o && setEvidence(null)}>
        <DialogContent className="max-w-lg">
          {evidence && (
            <>
              <DialogHeader><DialogTitle>{evidence.type} · {evidence.id}</DialogTitle><DialogDescription>{evidence.camera} · {evidence.time}</DialogDescription></DialogHeader>
              <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 grid-bg relative overflow-hidden">
                <div className="absolute inset-0 scan-line opacity-40" />
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-destructive text-white text-[10px] font-semibold">EVIDENCE FRAME</div>
              </div>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div><strong className="text-foreground">Detail:</strong> {evidence.detail}</div>
                <div><strong className="text-foreground">Severity:</strong> {evidence.severity}</div>
                <div><strong className="text-foreground">Status:</strong> {evidence.status}</div>
              </div>
              <DialogFooter>
                <button onClick={() => toast.success("Snapshot downloaded")} className="h-9 px-3 rounded-md border text-sm">Download Frame</button>
                <button onClick={() => { setList((p) => p.map((x) => x.id === evidence.id ? { ...x, status: "Resolved" } : x)); toast.success("Resolved"); setEvidence(null); }} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm">Mark Resolved</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!assigning} onOpenChange={(o) => !o && setAssigning(null)}>
        <DialogContent className="max-w-sm">
          {assigning && (
            <>
              <DialogHeader><DialogTitle>Assign {assigning.id}</DialogTitle><DialogDescription>Choose an admin to handle this incident.</DialogDescription></DialogHeader>
              <div className="space-y-2">
                {admins.map((a) => (
                  <button key={a} onClick={() => { toast.success(`Assigned to ${a}`); setAssigning(null); }} className="w-full p-2.5 rounded-md border text-sm text-left hover:bg-secondary">{a}</button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
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
