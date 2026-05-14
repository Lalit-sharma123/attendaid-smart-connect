import { createFileRoute } from "@tanstack/react-router";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { cameras } from "@/lib/mock-data";
import { Plus, PlayCircle, Settings2, Power } from "lucide-react";

export const Route = createFileRoute("/admin/cameras")({
  component: Cams,
  head: () => ({ meta: [{ title: "Cameras — SmartAttend" }] }),
});

function Cams() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Camera Management</h1>
          <p className="text-sm text-muted-foreground">Monitor stream health, latency, and AI model assignment.</p>
        </div>
        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Plus className="size-4" /> Add Camera</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cameras.map((c) => (
          <div key={c.id} className="rounded-xl border bg-card overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-700 grid-bg">
              {c.status !== "offline" && <div className="absolute inset-0 scan-line" />}
              <div className="absolute top-3 left-3"><StatusBadge status={c.status} /></div>
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/60 text-white text-[10px] font-mono backdrop-blur">{c.id}</div>
              <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[10px] text-white/80">
                <span className="bg-black/60 px-2 py-1 rounded backdrop-blur">{c.fps} FPS</span>
                <span className="bg-black/60 px-2 py-1 rounded backdrop-blur">{c.latency} ms</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.location}</div>
                </div>
                <button className="size-8 rounded-md hover:bg-secondary grid place-items-center"><Power className="size-4" /></button>
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
                <button className="flex-1 h-8 inline-flex items-center justify-center gap-1 rounded-md bg-secondary text-xs"><PlayCircle className="size-3.5" /> Test</button>
                <button className="flex-1 h-8 inline-flex items-center justify-center gap-1 rounded-md bg-secondary text-xs"><Settings2 className="size-3.5" /> Calibrate</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
