import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/ui-kit";

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
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Help &amp; Support</h1>
      <SectionCard title="Frequently Asked Questions">
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f.q} className="p-4 rounded-lg bg-secondary/40">
              <div className="text-sm font-medium">{f.q}</div>
              <div className="text-xs text-muted-foreground mt-1">{f.a}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
