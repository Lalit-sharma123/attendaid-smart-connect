import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SectionCard } from "@/components/ui-kit";
import { KeyRound, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/student/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "My Profile — SmartAttend" }] }),
});

function Profile() {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState({ cur: "", n: "", c: "" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard>
          <div className="text-center">
            <div className="mx-auto size-28 rounded-full bg-gradient-to-br from-primary to-info grid place-items-center text-primary-foreground text-3xl font-semibold">RS</div>
            <div className="mt-4 text-lg font-semibold">Rahul Sharma</div>
            <div className="text-xs text-muted-foreground font-mono">BCA-1021</div>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 text-success text-xs">
              <CheckCircle2 className="size-3.5" /> Face Enrolled
            </div>
            <button onClick={() => setOpen(true)} className="mt-5 w-full h-9 rounded-md border text-sm inline-flex items-center justify-center gap-2"><KeyRound className="size-4" /> Change Password</button>
          </div>
        </SectionCard>

        <SectionCard title="Academic Info" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Department", "BCA"], ["Class", "3rd Year"],
              ["Section", "A"], ["Roll Number", "BCA-1021"],
              ["Account Status", "Active"], ["Last Attendance", "Today · 08:42 AM"],
              ["Enrollment Date", "12 Aug 2024"], ["Consent", "Granted"],
            ].map(([k, v]) => (
              <div key={k} className="p-3 rounded-lg bg-secondary/40">
                <div className="text-[11px] text-muted-foreground">{k}</div>
                <div className="text-sm font-medium mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Contact" className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3"><Mail className="size-4 text-muted-foreground" /> rahul.sharma@uni.edu</div>
            <div className="flex items-center gap-3"><Phone className="size-4 text-muted-foreground" /> +91 98•••• 4521</div>
            <div className="flex items-center gap-3"><MapPin className="size-4 text-muted-foreground" /> Hostel B · Room 214</div>
          </div>
        </SectionCard>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Change Password</DialogTitle><DialogDescription>Use 8+ characters.</DialogDescription></DialogHeader>
          <div className="space-y-3 text-sm">
            <input type="password" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} placeholder="Current password" className="w-full h-9 px-3 rounded-md border bg-card" />
            <input type="password" value={pw.n} onChange={(e) => setPw({ ...pw, n: e.target.value })} placeholder="New password" className="w-full h-9 px-3 rounded-md border bg-card" />
            <input type="password" value={pw.c} onChange={(e) => setPw({ ...pw, c: e.target.value })} placeholder="Confirm new password" className="w-full h-9 px-3 rounded-md border bg-card" />
          </div>
          <DialogFooter>
            <button onClick={() => {
              if (!pw.cur || !pw.n) { toast.error("Fill all fields"); return; }
              if (pw.n !== pw.c) { toast.error("Passwords don't match"); return; }
              toast.success("Password updated"); setOpen(false); setPw({ cur: "", n: "", c: "" });
            }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Update</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
