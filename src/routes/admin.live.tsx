import { createFileRoute } from "@tanstack/react-router";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { liveDetections, cameras } from "@/lib/mock-data";
import { Maximize2, Pause, Play, Activity, Cpu, Wifi } from "lucide-react";

export const Route = createFileRoute("/admin/live")({
  component: Live,
  head: () => ({ meta: [{ title: "AI Live Monitor — SmartAttend" }] }),
});

function CameraTile({ cam, idx }: { cam: typeof cameras[number]; idx: number }) {
  const detections = [
    { name: "Rahul Sharma", roll: "BCA-1021", conf: 94, live: 91, x: 30, y: 35, w: 25, h: 32, status: "ok" },
    { name: "Priya Verma", roll: "BCA-1022", conf: 96, live: 93, x: 60, y: 30, w: 22, h: 28, status: "ok" },
  ];
  const spoof = idx === 0;
  const unknown = idx === 1;

  return (
    <div className="rounded-xl border bg-card overflow-hidden group">
      <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 grid-bg">
        <div className="absolute inset-0 scan-line opacity-40" />
        {detections.map((d, i) => (
          <div
            key={i}
            className="absolute border-2 rounded-md"
            style={{
              left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%`,
              borderColor: spoof && i === 0 ? "var(--color-destructive)" : unknown && i === 1 ? "var(--color-warning)" : "var(--color-success)",
              boxShadow: `0 0 0 4px ${spoof && i === 0 ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.12)"}`,
            }}
          >
            <div className="absolute -top-7 left-0 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
              style={{
                background: spoof && i === 0 ? "var(--color-destructive)" : unknown && i === 1 ? "var(--color-warning)" : "var(--color-success)",
                color: "white",
              }}>
              {spoof && i === 0 ? `Spoof Alert · Live ${d.live}%`
                : unknown && i === 1 ? `Unknown Face · ${d.conf}%`
                : `${d.name} · ${d.roll} · ${d.conf}%`}
            </div>
          </div>
        ))}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-destructive text-white text-[10px] font-semibold flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </span>
          <span className="px-2 py-1 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur">{cam.name}</span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-white/80 bg-black/50 px-2 py-1 rounded backdrop-blur">
          {cam.fps} FPS · {cam.latency}ms
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button className="size-8 rounded-md bg-black/60 text-white grid place-items-center backdrop-blur"><Pause className="size-3.5" /></button>
            <button className="size-8 rounded-md bg-black/60 text-white grid place-items-center backdrop-blur"><Maximize2 className="size-3.5" /></button>
          </div>
          <span className="text-[10px] text-white/70 bg-black/50 px-2 py-1 rounded backdrop-blur">{cam.location}</span>
        </div>
      </div>
    </div>
  );
}

function Live() {
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
          {cameras.slice(0, 4).map((c, i) => <CameraTile key={c.id} cam={c} idx={i} />)}
        </div>

        <SectionCard title="Real-Time Event Stream">
          <div className="space-y-2 max-h-[640px] overflow-y-auto -mx-2 px-2">
            {[...liveDetections, ...liveDetections].map((d, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/40 border border-border/60">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  <div className="text-[11px] text-muted-foreground">{d.camera} · #{d.id} · conf {d.confidence}% / live {d.liveness}%</div>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
