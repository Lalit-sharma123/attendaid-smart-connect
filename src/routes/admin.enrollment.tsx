import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/ui-kit";
import { Camera, CheckCircle2, AlertTriangle, RefreshCw, Save } from "lucide-react";

export const Route = createFileRoute("/admin/enrollment")({
  component: Enrollment,
  head: () => ({ meta: [{ title: "Face Enrollment — SmartAttend" }] }),
});

function Enrollment() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Face Enrollment</h1>
        <p className="text-sm text-muted-foreground">Capture multi-angle samples and generate secure embeddings.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Student Profile">
          <div className="text-center">
            <div className="mx-auto size-24 rounded-full bg-gradient-to-br from-primary to-info grid place-items-center text-primary-foreground text-2xl font-semibold">SP</div>
            <div className="mt-3 font-semibold">Sneha Patel</div>
            <div className="text-xs text-muted-foreground">BBA-2014 · 2nd Year · Section A</div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs">
              <div className="p-2 rounded bg-secondary/50"><div className="text-muted-foreground">Department</div>BBA</div>
              <div className="p-2 rounded bg-secondary/50"><div className="text-muted-foreground">Email</div>sneha@uni.edu</div>
              <div className="p-2 rounded bg-secondary/50"><div className="text-muted-foreground">Status</div>Pending</div>
              <div className="p-2 rounded bg-secondary/50"><div className="text-muted-foreground">Consent</div>Granted</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Live Capture" className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-5">
            <div>
              <div className="relative aspect-video rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 grid-bg overflow-hidden">
                <div className="absolute inset-12 border-2 border-dashed border-success/70 rounded-full" />
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 text-white text-[10px] backdrop-blur">Webcam · 1080p · 30 FPS</div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-2">
                  <button className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm"><Camera className="size-4" /> Capture Face</button>
                  <button className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-white/10 text-white text-sm backdrop-blur"><RefreshCw className="size-4" /> Re-enroll</button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {["Front", "Left 15°", "Right 15°", "Up 10°", "Down 10°", "Smile"].map((label, i) => (
                  <div key={label} className="aspect-square rounded-lg border bg-secondary/40 grid place-items-center text-[11px] text-muted-foreground relative overflow-hidden">
                    {i < 4 ? <CheckCircle2 className="size-5 text-success absolute top-2 right-2" /> : null}
                    <div className="size-12 rounded-full bg-gradient-to-br from-primary/30 to-info/30 mb-1" />
                    <div className="absolute bottom-1 left-1 right-1 text-center">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Face Quality</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-success">94%</div>
                <div className="h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
                  <div className="h-full bg-success" style={{ width: "94%" }} />
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Liveness</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-success">Verified</div>
                <div className="text-[11px] text-muted-foreground mt-1">2 blinks · head turn ✓</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Embedding Generation</div>
                <div className="h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "72%" }} />
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 tabular-nums">512-D vector · 72%</div>
              </div>

              <div className="rounded-lg border p-3 space-y-1.5 text-xs">
                <div className="font-medium mb-1">AI Feedback</div>
                <div className="flex items-center gap-2 text-success"><CheckCircle2 className="size-3.5" /> Lighting OK</div>
                <div className="flex items-center gap-2 text-success"><CheckCircle2 className="size-3.5" /> Sharp focus</div>
                <div className="flex items-center gap-2 text-warning-foreground"><AlertTriangle className="size-3.5 text-warning" /> Slight head tilt</div>
              </div>

              <button className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-success text-success-foreground text-sm font-medium">
                <Save className="size-4" /> Save Embedding
              </button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
