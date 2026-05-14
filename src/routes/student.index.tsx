import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/ui-kit";
import { CheckCircle2, Camera, Eye, Brain, ScanFace, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/student/")({
  component: Mark,
  head: () => ({ meta: [{ title: "Mark Attendance — SmartAttend" }] }),
});

const steps = [
  { label: "Detecting Face", icon: ScanFace, done: true },
  { label: "Checking Liveness", icon: Eye, done: true },
  { label: "Recognizing Identity", icon: Brain, done: true, active: true },
  { label: "Marking Attendance", icon: CheckCircle2, done: false },
];

function Mark() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mark Today's Attendance</h1>
        <p className="text-sm text-muted-foreground">Look at the camera. Liveness verification protects against spoofing.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <SectionCard>
          <div className="relative aspect-video rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 grid-bg overflow-hidden">
            <div className="absolute inset-0 scan-line opacity-50" />
            <div className="absolute inset-x-1/4 inset-y-12 border-2 border-success rounded-3xl" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)" }}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-success text-white text-[11px] font-medium">Face aligned · Liveness verified</div>
            </div>
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-2 py-1 rounded bg-destructive text-white text-[10px] font-semibold flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-white animate-pulse" /> LIVE
              </span>
              <span className="px-2 py-1 rounded bg-black/60 text-white text-[10px] backdrop-blur">Front Camera · 1080p</span>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-success text-white text-sm font-medium flex items-center gap-2 shadow-xl">
              <CheckCircle2 className="size-4" /> Attendance marked successfully · 09:24 AM
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`p-3 rounded-lg border flex items-center gap-3 ${s.done ? "bg-success/5 border-success/30" : s.active ? "bg-primary/5 border-primary/30" : "bg-secondary/30"}`}>
                  <div className={`size-8 rounded-md grid place-items-center ${s.done ? "bg-success text-white" : s.active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
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
              <div className="flex items-center gap-2 text-success"><CheckCircle2 className="size-4" /> Blink detected</div>
              <div className="flex items-center gap-2 text-success"><CheckCircle2 className="size-4" /> Liveness verified</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Camera className="size-4" /> Hold position…</div>
            </div>
          </SectionCard>

          <SectionCard title="AI Scores">
            <div className="grid grid-cols-2 gap-3">
              <Score label="Confidence" value={94} />
              <Score label="Liveness" value={91} />
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

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-secondary/30 p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold tabular-nums text-success mt-1">{value}%</div>
      <div className="h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
        <div className="h-full bg-success" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
