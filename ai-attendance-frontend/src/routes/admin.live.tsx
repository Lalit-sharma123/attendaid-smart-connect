import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { liveDetections, cameras } from "@/lib/mock-data";
import { Maximize2, Pause, Play, Activity, Cpu, Wifi, Camera as CameraIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/live")({
  component: Live,
  head: () => ({ meta: [{ title: "AI Live Monitor — SmartAttend" }] }),
});

function Live() {
  const [openCam, setOpenCam] = useState<typeof cameras[number] | null>(null);
  const [paused, setPaused] = useState<Record<string, boolean>>({});
  const [eventDetail, setEventDetail] = useState<typeof liveDetections[number] | null>(null);

  const togglePause = (id: string) => {
    setPaused((p) => { const v = !p[id]; toast(v ? "Paused" : "Resumed"); return { ...p, [id]: v }; });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Live Monitor</h1>
          <p className="text-sm text-muted-foreground">Real-time face detection, liveness, and anti-spoofing across all cameras.</p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success/10 text-success"><Activity className="size-3.5" /> Recognition Model: Online</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success/10 text-success"><Cpu className="size-3.5" /> Liveness v3: Online</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-info/10 text-info"><Wifi className="size-3.5" /> Edge Latency: 92ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cameras.slice(0, 4).map((cam, idx) => {
            const detections = [
              { name: "Rahul Sharma", roll: "BCA-1021", conf: 94, live: 91, x: 30, y: 35, w: 25, h: 32 },
              { name: "Priya Verma", roll: "BCA-1022", conf: 96, live: 93, x: 60, y: 30, w: 22, h: 28 },
            ];
            const spoof = idx === 0;
            const unknown = idx === 1;
            const isPaused = !!paused[cam.id];
            return (
              <div key={cam.id} className="rounded-xl border bg-card overflow-hidden group">
                <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 grid-bg cursor-pointer" onClick={() => setOpenCam(cam)}>
                  {!isPaused && <div className="absolute inset-0 scan-line opacity-40" />}
                  {detections.map((d, i) => (
                    <div key={i} onClick={(e) => { e.stopPropagation();
                      const det = spoof && i === 0 ? { ...liveDetections[3] } : unknown && i === 1 ? { ...liveDetections[2] } : { ...liveDetections[i], name: d.name, roll: d.roll };
                      setEventDetail(det as any);
                    }}
                      className="absolute border-2 rounded-md cursor-pointer hover:scale-[1.02] transition-transform"
                      style={{
                        left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%`,
                        borderColor: spoof && i === 0 ? "var(--color-destructive)" : unknown && i === 1 ? "var(--color-warning)" : "var(--color-success)",
                        boxShadow: `0 0 0 4px ${spoof && i === 0 ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.12)"}`,
                      }}>
                      <div className="absolute -top-7 left-0 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
                        style={{ background: spoof && i === 0 ? "var(--color-destructive)" : unknown && i === 1 ? "var(--color-warning)" : "var(--color-success)", color: "white" }}>
                        {spoof && i === 0 ? `Spoof Alert · Live ${d.live}%` : unknown && i === 1 ? `Unknown Face · ${d.conf}%` : `${d.name} · ${d.roll} · ${d.conf}%`}
                      </div>
                    </div>
                  ))}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-destructive text-white text-[10px] font-semibold flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-white animate-pulse" /> LIVE
                    </span>
                    <span className="px-2 py-1 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur">{cam.name}</span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-white/80 bg-black/50 px-2 py-1 rounded backdrop-blur">{cam.fps} FPS · {cam.latency}ms</div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button onClick={() => togglePause(cam.id)} className="size-8 rounded-md bg-black/60 text-white grid place-items-center backdrop-blur">
                        {isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                      </button>
                      <button onClick={() => setOpenCam(cam)} className="size-8 rounded-md bg-black/60 text-white grid place-items-center backdrop-blur"><Maximize2 className="size-3.5" /></button>
                    </div>
                    <span className="text-[10px] text-white/70 bg-black/50 px-2 py-1 rounded backdrop-blur">{cam.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <SectionCard title="Real-Time Event Stream">
          <div className="space-y-2 max-h-[640px] overflow-y-auto -mx-2 px-2">
            {[...liveDetections, ...liveDetections].map((d, i) => (
              <button key={i} onClick={() => setEventDetail(d)} className="w-full flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/40 border border-border/60 hover:bg-secondary text-left">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  <div className="text-[11px] text-muted-foreground">{d.camera} · #{d.id} · conf {d.confidence}% / live {d.liveness}%</div>
                </div>
                <StatusBadge status={d.status} />
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <Dialog open={!!openCam} onOpenChange={(o) => !o && setOpenCam(null)}>
        <DialogContent className="max-w-4xl">
          {openCam && (
            <>
              <DialogHeader><DialogTitle>{openCam.name}</DialogTitle><DialogDescription>{openCam.location} · {openCam.fps} FPS · {openCam.latency}ms</DialogDescription></DialogHeader>
              <div className="relative aspect-video rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 grid-bg overflow-hidden">
                <div className="absolute inset-0 scan-line opacity-50" />
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-destructive text-white text-[10px] font-semibold">● LIVE · Fullscreen</div>
              </div>
              <DialogFooter className="flex-wrap gap-2">
                <button onClick={() => togglePause(openCam.id)} className="h-9 px-3 rounded-md border text-sm inline-flex items-center gap-1.5">{paused[openCam.id] ? <Play className="size-3.5" /> : <Pause className="size-3.5" />} {paused[openCam.id] ? "Resume" : "Pause"} Stream</button>
                <button onClick={() => toast.success("Snapshot captured")} className="h-9 px-3 rounded-md border text-sm inline-flex items-center gap-1.5"><CameraIcon className="size-3.5" /> Capture Snapshot</button>
                <button onClick={() => toast.success("Issue reported")} className="h-9 px-3 rounded-md border text-sm">Report Issue</button>
                <button onClick={() => toast.success("Opening camera settings")} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm">Camera Settings</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!eventDetail} onOpenChange={(o) => !o && setEventDetail(null)}>
        <DialogContent className="max-w-sm">
          {eventDetail && (
            <>
              <DialogHeader><DialogTitle>{eventDetail.name}</DialogTitle><DialogDescription>{eventDetail.camera} · {eventDetail.id}</DialogDescription></DialogHeader>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Roll</span><span className="font-mono">{eventDetail.roll}</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Confidence</span><span>{eventDetail.confidence}%</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Liveness</span><span>{eventDetail.liveness}%</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Status</span><StatusBadge status={eventDetail.status} /></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
