import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { SectionCard } from "@/components/ui-kit";
import { CheckCircle2, Camera, Eye, Brain, ScanFace, AlertTriangle, ShieldAlert, RotateCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student/")({
  component: Mark,
  head: () => ({ meta: [{ title: "Mark Attendance — SmartAttend" }] }),
});

const stepDefs = [
  { label: "Detecting Face", icon: ScanFace },
  { label: "Checking Liveness", icon: Eye },
  { label: "Recognizing Identity", icon: Brain },
  { label: "Marking Attendance", icon: CheckCircle2 },
];

function Mark() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [spoof, setSpoof] = useState(false);
  const timer = useRef<number | null>(null);

  const reset = () => {
    if (timer.current) window.clearInterval(timer.current);
    setStep(0); setDone(false); setSpoof(false); setRunning(false);
  };

  const start = (forceSpoof = false) => {
    reset();
    setRunning(true);
    let s = 0;
    timer.current = window.setInterval(() => {
      s += 1;
      if (forceSpoof && s === 2) {
        setSpoof(true); setRunning(false);
        if (timer.current) window.clearInterval(timer.current);
        toast.error("Spoof detected · Liveness 18%");
        return;
      }
      setStep(s);
      if (s >= stepDefs.length) {
        if (timer.current) window.clearInterval(timer.current);
        setDone(true); setRunning(false);
        toast.success("Attendance marked · 09:24 AM");
      }
    }, 700);
  };

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mark Today's Attendance</h1>
          <p className="text-sm text-muted-foreground">Look at the camera. Liveness verification protects against spoofing.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => start(false)} disabled={running} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50">{done || spoof ? "Retry" : "Start"}</button>
          <button onClick={() => start(true)} disabled={running} className="h-9 px-3 rounded-md border text-sm inline-flex items-center gap-1.5 disabled:opacity-50"><ShieldAlert className="size-3.5" /> Simulate Spoof</button>
          <button onClick={reset} className="size-9 rounded-md border grid place-items-center"><RotateCw className="size-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <SectionCard>
          <div className="relative aspect-video rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 grid-bg overflow-hidden">
            {running && <div className="absolute inset-0 scan-line opacity-50" />}
            <div className={`absolute inset-x-1/4 inset-y-12 border-2 rounded-3xl ${spoof ? "border-destructive" : done ? "border-success" : "border-primary"}`} style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)" }}>
              <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-white text-[11px] font-medium ${spoof ? "bg-destructive" : done ? "bg-success" : "bg-primary"}`}>
                {spoof ? "Spoof detected — use live camera" : done ? "Face aligned · Liveness verified" : running ? "Hold still…" : "Tap Start to begin"}
              </div>
            </div>
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-2 py-1 rounded bg-destructive text-white text-[10px] font-semibold flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-white animate-pulse" /> LIVE
              </span>
              <span className="px-2 py-1 rounded bg-black/60 text-white text-[10px] backdrop-blur">Front Camera · 1080p</span>
            </div>
            {done && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-success text-white text-sm font-medium flex items-center gap-2 shadow-xl">
                <CheckCircle2 className="size-4" /> Attendance marked successfully · 09:24 AM
              </div>
            )}
            {spoof && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-destructive text-white text-sm font-medium flex items-center gap-2 shadow-xl">
                <ShieldAlert className="size-4" /> Spoof attempt blocked
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {stepDefs.map((s, i) => {
              const Icon = s.icon;
              const isDone = i < step || done;
              const isActive = i === step && running;
              return (
                <div key={s.label} className={`p-3 rounded-lg border flex items-center gap-3 ${isDone ? "bg-success/5 border-success/30" : isActive ? "bg-primary/5 border-primary/30" : "bg-secondary/30"}`}>
                  <div className={`size-8 rounded-md grid place-items-center ${isDone ? "bg-success text-white" : isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Step {i + 1}</div>
                    <div className="text-xs font-medium">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Live Feedback">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-success"><CheckCircle2 className="size-4" /> Face inside frame</div>
              <div className="flex items-center gap-2 text-success"><CheckCircle2 className="size-4" /> Lighting OK</div>
              <div className={`flex items-center gap-2 ${spoof ? "text-destructive" : "text-success"}`}><CheckCircle2 className="size-4" /> {spoof ? "Liveness failed" : "Blink detected"}</div>
              <div className={`flex items-center gap-2 ${spoof ? "text-destructive" : "text-success"}`}><CheckCircle2 className="size-4" /> {spoof ? "Spoof signal: screen reflection" : "Liveness verified"}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Camera className="size-4" /> Hold position…</div>
            </div>
          </SectionCard>

          <SectionCard title="AI Scores">
            <div className="grid grid-cols-2 gap-3">
              <Score label="Confidence" value={spoof ? 71 : 94} ok={!spoof} />
              <Score label="Liveness" value={spoof ? 18 : 91} ok={!spoof} />
            </div>
          </SectionCard>

          <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 flex gap-3">
            <AlertTriangle className="size-5 text-warning-foreground shrink-0" />
            <div className="text-xs">
              <div className="font-medium">Privacy notice</div>
              Your face embedding is encrypted (AES-256) and used only for attendance. Raw video is never stored.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Score({ label, value, ok }: { label: string; value: number; ok: boolean }) {
  return (
    <div className="rounded-lg border bg-secondary/30 p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold tabular-nums mt-1 ${ok ? "text-success" : "text-destructive"}`}>{value}%</div>
      <div className="h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
        <div className={`h-full ${ok ? "bg-success" : "bg-destructive"}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
