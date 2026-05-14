import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Shield, ScanFace, KeyRound, Smartphone, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Sign in — SmartAttend" }] }),
});

function Login() {
  const [role, setRole] = useState<"admin" | "student">("admin");
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative bg-sidebar text-sidebar-foreground p-10 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-32 -right-32 size-[480px] rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 -left-20 size-[380px] rounded-full bg-info/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-sidebar-primary grid place-items-center">
              <Sparkles className="size-5 text-sidebar-primary-foreground" />
            </div>
            <div className="text-lg font-semibold text-white tracking-tight">SmartAttend</div>
          </div>
        </div>
        <div className="relative space-y-6 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-white">
            AI-powered attendance with face recognition, liveness, and anti-spoofing.
          </h2>
          <p className="text-sm text-white/70">
            JWT-secured, privacy-first biometric attendance for universities and enterprises.
            Real-time monitoring across cameras with predictive analytics.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { i: ScanFace, t: "Face Recognition", s: "ArcFace R100" },
              { i: Shield, t: "Anti-Spoofing", s: "Liveness v3" },
              { i: KeyRound, t: "JWT + 2FA", s: "Enterprise SSO" },
              { i: Smartphone, t: "Multi-Device", s: "Web · Mobile · Edge" },
            ].map((f) => {
              const Icon = f.i;
              return (
                <div key={f.t} className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <Icon className="size-4 text-primary mb-2" />
                  <div className="font-medium text-white">{f.t}</div>
                  <div className="text-white/60 text-[11px]">{f.s}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative text-[11px] text-white/50">© 2026 SmartAttend · SOC 2 Type II · GDPR</div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in to SmartAttend</h1>
            <p className="text-sm text-muted-foreground mt-1">Choose your portal to continue</p>
          </div>

          <div className="grid grid-cols-2 p-1 rounded-lg bg-secondary mb-6">
            <button onClick={() => setRole("admin")}
              className={`h-10 rounded-md text-sm font-medium transition-colors ${role === "admin" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
              Admin
            </button>
            <button onClick={() => setRole("student")}
              className={`h-10 rounded-md text-sm font-medium transition-colors ${role === "student" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
              Student
            </button>
          </div>

          <form className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email or Roll Number</label>
              <input className="mt-1.5 w-full h-10 px-3 rounded-md border bg-card outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder={role === "admin" ? "admin@uni.edu" : "BCA-1021"} />
            </div>
            <div>
              <div className="flex justify-between">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <a className="text-xs text-primary">Forgot password?</a>
              </div>
              <input type="password" className="mt-1.5 w-full h-10 px-3 rounded-md border bg-card outline-none focus:ring-2 focus:ring-ring text-sm" placeholder="••••••••" />
            </div>

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" defaultChecked /> Use two-factor authentication
            </label>

            <Link to={role === "admin" ? "/admin" : "/student"}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90">
              Continue to {role === "admin" ? "Admin Portal" : "Student Portal"} <ArrowRight className="size-4" />
            </Link>

            <div className="text-center text-[11px] text-muted-foreground pt-2">
              Last login: Yesterday 18:42 from Mumbai · 192.168.•.•
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
