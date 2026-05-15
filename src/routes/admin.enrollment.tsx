import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SectionCard } from "@/components/ui-kit";
import { Camera, CheckCircle2, AlertTriangle, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { students } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/enrollment")({
  component: Enrollment,
  head: () => ({ meta: [{ title: "Face Enrollment — SmartAttend" }] }),
});

const angles = ["Front", "Left 15°", "Right 15°", "Up 10°", "Down 10°", "Smile"];

function Enrollment() {
  const [studentRoll, setStudentRoll] = useState(students.find((s) => !s.enrolled)?.roll ?? students[0].roll);
  const student = students.find((s) => s.roll === studentRoll) ?? students[0];
  const [captured, setCaptured] = useState(4);
  const [embedding, setEmbedding] = useState(72);
  const [generating, setGenerating] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const capture = () => {
    if (captured >= angles.length) { toast("All angles captured"); return; }
    setCaptured((c) => c + 1); toast.success(`Captured ${angles[captured]}`);
  };
  const generate = () => {
    setGenerating(true);
    let v = embedding;
    const id = setInterval(() => {
      v = Math.min(100, v + 5);
      setEmbedding(v);
      if (v >= 100) { clearInterval(id); setGenerating(false); toast.success("Embedding generated · 512-D"); }
    }, 120);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Face Enrollment</h1>
        <p className="text-sm text-muted-foreground">Capture multi-angle samples and generate secure embeddings.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Student Profile">
          <div className="text-center">
            <div className="mx-auto size-24 rounded-full bg-gradient-to-br from-primary to-info grid place-items-center text-primary-foreground text-2xl font-semibold">
              {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="mt-3 font-semibold">{student.name}</div>
            <div className="text-xs text-muted-foreground">{student.roll} · {student.cls} · Section {student.section}</div>
            <select value={studentRoll} onChange={(e) => { setStudentRoll(e.target.value); setCaptured(0); setEmbedding(0); setEnrolled(false); }} className="mt-4 w-full h-9 px-2 rounded-md border bg-card text-sm">
              {students.map((s) => <option key={s.roll} value={s.roll}>{s.name} · {s.roll}</option>)}
            </select>
            <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs">
              <div className="p-2 rounded bg-secondary/50"><div className="text-muted-foreground">Department</div>{student.dept}</div>
              <div className="p-2 rounded bg-secondary/50"><div className="text-muted-foreground">Status</div>{enrolled ? "Enrolled" : student.status}</div>
              <div className="p-2 rounded bg-secondary/50"><div className="text-muted-foreground">Captured</div>{captured}/{angles.length}</div>
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
                  <button onClick={capture} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm"><Camera className="size-4" /> Capture Face</button>
                  <button onClick={() => setResetOpen(true)} className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-white/10 text-white text-sm backdrop-blur"><RefreshCw className="size-4" /> Re-enroll</button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {angles.map((label, i) => (
                  <div key={label} className="aspect-square rounded-lg border bg-secondary/40 grid place-items-center text-[11px] text-muted-foreground relative overflow-hidden">
                    {i < captured ? <CheckCircle2 className="size-5 text-success absolute top-2 right-2" /> : null}
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
                <div className="h-1.5 rounded-full bg-secondary mt-2 overflow-hidden"><div className="h-full bg-success" style={{ width: "94%" }} /></div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Liveness</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-success">Verified</div>
                <div className="text-[11px] text-muted-foreground mt-1">2 blinks · head turn ✓</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground flex justify-between"><span>Embedding Generation</span>
                  <button onClick={generate} disabled={generating} className="text-primary text-[11px] disabled:opacity-50">{generating ? "Generating…" : "Generate"}</button>
                </div>
                <div className="h-1.5 rounded-full bg-secondary mt-2 overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${embedding}%` }} /></div>
                <div className="text-[11px] text-muted-foreground mt-1 tabular-nums">512-D vector · {embedding}%</div>
              </div>

              <div className="rounded-lg border p-3 space-y-1.5 text-xs">
                <div className="font-medium mb-1">AI Feedback</div>
                <div className="flex items-center gap-2 text-success"><CheckCircle2 className="size-3.5" /> Lighting OK</div>
                <div className="flex items-center gap-2 text-success"><CheckCircle2 className="size-3.5" /> Sharp focus</div>
                <div className="flex items-center gap-2 text-warning-foreground"><AlertTriangle className="size-3.5 text-warning" /> {captured < 4 ? "Capture more angles" : "Slight head tilt"}</div>
              </div>

              <button onClick={() => {
                if (captured < 3) { toast.error("Capture at least 3 angles"); return; }
                if (embedding < 100) { toast.error("Generate embedding first"); return; }
                setEnrolled(true); toast.success(`${student.name} enrolled successfully`);
              }} className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-success text-success-foreground text-sm font-medium">
                <Save className="size-4" /> Save Embedding
              </button>
            </div>
          </div>
        </SectionCard>
      </div>

      <ConfirmDialog open={resetOpen} onOpenChange={setResetOpen}
        title="Clear all captured samples?"
        description="You'll need to capture all angles again."
        confirmLabel="Clear" destructive
        onConfirm={() => { setCaptured(0); setEmbedding(0); setEnrolled(false); toast.success("Samples cleared"); }} />
    </div>
  );
}
