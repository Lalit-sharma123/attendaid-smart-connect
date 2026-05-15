import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { cameras as initial } from "@/lib/mock-data";
import { Plus, PlayCircle, Settings2, Power, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/admin/cameras")({
  component: Cams,
  head: () => ({ meta: [{ title: "Cameras — SmartAttend" }] }),
});

function Cams() {
  const [list, setList] = useState(initial);
  const [addOpen, setAddOpen] = useState(false);
  const [streamOf, setStreamOf] = useState<typeof initial[number] | null>(null);
  const [calibrate, setCalibrate] = useState<typeof initial[number] | null>(null);
  const [editing, setEditing] = useState<typeof initial[number] | null>(null);
  const [deleting, setDeleting] = useState<typeof initial[number] | null>(null);
  const [form, setForm] = useState({ name: "", location: "", rtsp: "" });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Camera Management</h1>
          <p className="text-sm text-muted-foreground">Monitor stream health, latency, and AI model assignment.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Plus className="size-4" /> Add Camera</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((c) => (
          <div key={c.id} className="rounded-xl border bg-card overflow-hidden">
            <button onClick={() => setStreamOf(c)} className="block w-full text-left">
              <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-700 grid-bg">
                {c.status !== "offline" && <div className="absolute inset-0 scan-line" />}
                <div className="absolute top-3 left-3"><StatusBadge status={c.status} /></div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/60 text-white text-[10px] font-mono backdrop-blur">{c.id}</div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[10px] text-white/80">
                  <span className="bg-black/60 px-2 py-1 rounded backdrop-blur">{c.fps} FPS</span>
                  <span className="bg-black/60 px-2 py-1 rounded backdrop-blur">{c.latency} ms</span>
                </div>
              </div>
            </button>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.location}</div>
                </div>
                <button onClick={() => { setList((p) => p.map((x) => x.id === c.id ? { ...x, status: x.status === "offline" ? "online" : "offline" } : x)); toast.success(`${c.name} toggled`); }} className="size-8 rounded-md hover:bg-secondary grid place-items-center"><Power className="size-4" /></button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-secondary/50"><div className="text-muted-foreground">RTSP</div><div className="font-mono truncate">{c.rtsp}</div></div>
                <div className="p-2 rounded bg-secondary/50"><div className="text-muted-foreground">Model</div>{c.model}</div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] mb-1"><span className="text-muted-foreground">Health</span><span className="tabular-nums">{c.health}%</span></div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full ${c.health >= 80 ? "bg-success" : c.health >= 50 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${c.health}%` }} />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { toast.loading("Testing stream…", { id: c.id }); setTimeout(() => toast.success("Stream OK · 200ms", { id: c.id }), 900); }} className="flex-1 h-8 inline-flex items-center justify-center gap-1 rounded-md bg-secondary text-xs"><PlayCircle className="size-3.5" /> Test</button>
                <button onClick={() => setCalibrate(c)} className="flex-1 h-8 inline-flex items-center justify-center gap-1 rounded-md bg-secondary text-xs"><Settings2 className="size-3.5" /> Calibrate</button>
                <button onClick={() => setEditing(c)} className="size-8 rounded-md bg-secondary grid place-items-center"><Edit className="size-3.5" /></button>
                <button onClick={() => setDeleting(c)} className="size-8 rounded-md bg-secondary grid place-items-center text-destructive"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Camera</DialogTitle><DialogDescription>Connect a new RTSP camera to the platform.</DialogDescription></DialogHeader>
          <div className="space-y-3 text-sm">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full h-9 px-3 rounded-md border bg-card" />
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="w-full h-9 px-3 rounded-md border bg-card" />
            <input value={form.rtsp} onChange={(e) => setForm({ ...form, rtsp: e.target.value })} placeholder="rtsp://..." className="w-full h-9 px-3 rounded-md border bg-card font-mono" />
          </div>
          <DialogFooter>
            <button onClick={() => setAddOpen(false)} className="h-9 px-4 rounded-md border text-sm">Cancel</button>
            <button onClick={() => {
              if (!form.name) { toast.error("Name required"); return; }
              setList((p) => [...p, { id: `CAM-${String(p.length + 1).padStart(2, "0")}`, ...form, status: "online", fps: 30, latency: 80, health: 95, model: "ArcFace-R100" }]);
              toast.success("Camera added"); setAddOpen(false); setForm({ name: "", location: "", rtsp: "" });
            }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Add</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!streamOf} onOpenChange={(o) => !o && setStreamOf(null)}>
        <DialogContent className="max-w-3xl">
          {streamOf && (
            <>
              <DialogHeader><DialogTitle>{streamOf.name} — Live Stream</DialogTitle><DialogDescription>{streamOf.location} · {streamOf.fps} FPS · {streamOf.latency}ms</DialogDescription></DialogHeader>
              <div className="relative aspect-video rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 grid-bg overflow-hidden">
                <div className="absolute inset-0 scan-line" />
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-destructive text-white text-[10px] font-semibold">● LIVE</div>
              </div>
              <DialogFooter className="gap-2 flex-wrap sm:flex-nowrap">
                <button onClick={() => toast.success("Stream paused")} className="h-9 px-3 rounded-md border text-sm">Pause</button>
                <button onClick={() => toast.success("Snapshot captured")} className="h-9 px-3 rounded-md border text-sm">Capture Snapshot</button>
                <button onClick={() => toast.success("Issue reported")} className="h-9 px-3 rounded-md border text-sm">Report Issue</button>
                <button onClick={() => { setStreamOf(null); setEditing(streamOf); }} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm">Settings</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!calibrate} onOpenChange={(o) => !o && setCalibrate(null)}>
        <DialogContent className="max-w-md">
          {calibrate && (
            <>
              <DialogHeader><DialogTitle>Calibrate {calibrate.name}</DialogTitle><DialogDescription>Run AI calibration sequence.</DialogDescription></DialogHeader>
              <div className="space-y-2 text-sm">
                {["Face detection alignment", "Liveness baseline", "Lighting normalization", "Distance estimation"].map((s) => (
                  <div key={s} className="flex justify-between p-2.5 rounded bg-secondary/50"><span>{s}</span><span className="text-success">●</span></div>
                ))}
              </div>
              <DialogFooter>
                <button onClick={() => { toast.success(`${calibrate.name} calibrated`); setCalibrate(null); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Run Calibration</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          {editing && (
            <>
              <DialogHeader><DialogTitle>Edit {editing.name}</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <input defaultValue={editing.name} onChange={(e) => (editing.name = e.target.value)} className="w-full h-9 px-3 rounded-md border bg-card" />
                <input defaultValue={editing.location} onChange={(e) => (editing.location = e.target.value)} className="w-full h-9 px-3 rounded-md border bg-card" />
              </div>
              <DialogFooter>
                <button onClick={() => { setList((p) => p.map((c) => c.id === editing.id ? { ...c, name: editing.name, location: editing.location } : c)); toast.success("Saved"); setEditing(null); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Save</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name}?`} confirmLabel="Delete" destructive
        onConfirm={() => { if (deleting) { setList((p) => p.filter((c) => c.id !== deleting.id)); toast.success("Camera removed"); } setDeleting(null); }} />
    </div>
  );
}
