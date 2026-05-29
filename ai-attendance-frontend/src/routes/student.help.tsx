import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SectionCard } from "@/components/ui-kit";
import { ChevronDown, Mail } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/student/help")({
  component: Help,
  head: () => ({ meta: [{ title: "Help — SmartAttend" }] }),
});

const faqs = [
  { q: "What if my face isn't recognized?", a: "Ensure good lighting and look directly at the camera. If it persists, request re-enrollment from your department admin." },
  { q: "Why was my attendance marked as Spoof?", a: "Our liveness model detected an indicator of a printed photo, mobile screen, or video replay. Use the live camera, not a recording." },
  { q: "Can I mark attendance from my phone?", a: "Yes, the student portal works on any modern browser with camera access." },
  { q: "Is my face data safe?", a: "Only encrypted face embeddings are stored (AES-256). Raw video is never persisted." },
];

function Help() {
  const [open, setOpen] = useState<number | null>(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [msg, setMsg] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-semibold tracking-tight">Help &amp; Support</h1>
        <button onClick={() => setContactOpen(true)} className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Mail className="size-4" /> Contact Admin</button>
      </div>
      <SectionCard title="Frequently Asked Questions">
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={f.q} className="rounded-lg bg-secondary/40 overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full p-4 flex items-center justify-between text-left">
                <span className="text-sm font-medium">{f.q}</span>
                <ChevronDown className={`size-4 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="px-4 pb-4 text-xs text-muted-foreground">{f.a}</div>}
            </div>
          ))}
        </div>
      </SectionCard>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Contact Admin</DialogTitle><DialogDescription>Reply within 24 hours.</DialogDescription></DialogHeader>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Describe your issue…" className="w-full h-32 px-3 py-2 rounded-md border bg-card text-sm resize-none" />
          <DialogFooter>
            <button onClick={() => { if (!msg.trim()) { toast.error("Message required"); return; } toast.success("Message sent to admin"); setMsg(""); setContactOpen(false); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Send</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
