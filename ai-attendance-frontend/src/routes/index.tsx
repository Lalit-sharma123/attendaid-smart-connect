import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, ScanFace, Shield, BarChart3, Camera } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "SmartAttend — AI Smart Attendance System" },
      { name: "description", content: "AI-powered attendance with face recognition, liveness detection, and anti-spoofing for universities and enterprises." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 px-6 lg:px-10 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary grid place-items-center"><Sparkles className="size-5 text-primary-foreground" /></div>
          <div className="font-semibold tracking-tight">SmartAttend</div>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a>Product</a><a>Security</a><a>Pricing</a><a>Docs</a>
        </nav>
        <div className="flex gap-2">
          <Link to="/login" className="h-9 px-4 inline-flex items-center rounded-md border text-sm">Sign in</Link>
          <Link to="/admin" className="h-9 px-4 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm">Open Demo <ArrowRight className="size-4" /></Link>
        </div>
      </header>

      <section className="px-6 lg:px-10 py-16 lg:py-24 max-w-6xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Sparkles className="size-3.5" /> AI Smart Attendance · v3.4
        </span>
        <h1 className="mt-6 text-4xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
          Attendance, secured by <span className="text-primary">AI face recognition</span> and liveness.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time face recognition, anti-spoofing, and predictive analytics — built for universities, schools, and enterprises that need accuracy at scale.
        </p>
        <div className="mt-8 flex justify-center gap-3 flex-wrap">
          <Link to="/admin" className="h-11 px-5 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium glow-primary">
            Open Admin Dashboard <ArrowRight className="size-4" />
          </Link>
          <Link to="/student" className="h-11 px-5 inline-flex items-center gap-2 rounded-md border text-sm font-medium">
            Open Student Portal
          </Link>
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-24 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { i: ScanFace, t: "Face Recognition", d: "ArcFace R100 with 99.6% accuracy across 1,200+ faces." },
          { i: Shield, t: "Anti-Spoofing", d: "Detects printed photos, mobile screens, and video replay." },
          { i: Camera, t: "Multi-Camera", d: "Manage 14+ live RTSP cameras with health monitoring." },
          { i: BarChart3, t: "AI Analytics", d: "Predictive attendance, anomaly detection, smart alerts." },
        ].map((f) => {
          const Icon = f.i;
          return (
            <div key={f.t} className="rounded-xl border bg-card p-5">
              <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3"><Icon className="size-5" /></div>
              <div className="font-semibold">{f.t}</div>
              <div className="text-xs text-muted-foreground mt-1">{f.d}</div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
