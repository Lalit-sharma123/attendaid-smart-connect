import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — SmartAttend" }] }),
});

function Group({ title, fields }: { title: string; fields: { label: string; value: string; type?: "switch" | "text" }[] }) {
  return (
    <SectionCard title={title}>
      <div className="space-y-1">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <div className="text-sm font-medium">{f.label}</div>
              <div className="text-xs text-muted-foreground">{f.value}</div>
            </div>
            {f.type === "switch" ? (
              <div className="w-10 h-6 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 size-5 rounded-full bg-white shadow" />
              </div>
            ) : (
              <button className="h-8 px-3 rounded-md bg-secondary text-xs">Edit</button>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure attendance rules, AI thresholds, and system policies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Group title="Attendance Rules" fields={[
          { label: "Class start time", value: "09:00 AM" },
          { label: "Late threshold", value: "After 09:15 AM (15 min grace)" },
          { label: "Duplicate prevention", value: "1 mark per student per day", type: "switch" },
          { label: "Cross-camera dedupe window", value: "120 seconds" },
        ]} />
        <Group title="AI Thresholds" fields={[
          { label: "Recognition confidence", value: "Minimum 78%" },
          { label: "Liveness threshold", value: "Minimum 70%" },
          { label: "Active model", value: "ArcFace R100 + Liveness v3" },
          { label: "Auto re-train weekly", value: "Enabled", type: "switch" },
        ]} />
        <Group title="Notifications" fields={[
          { label: "Spoof attempt alert", value: "Email + In-app", type: "switch" },
          { label: "Low attendance digest", value: "Weekly Mondays 09:00", type: "switch" },
          { label: "Camera offline alert", value: "Immediate SMS", type: "switch" },
        ]} />
        <Group title="Security & Privacy" fields={[
          { label: "Two-factor authentication", value: "Required for admins", type: "switch" },
          { label: "Session timeout", value: "30 minutes inactivity" },
          { label: "Face embedding encryption", value: "AES-256 at rest", type: "switch" },
          { label: "Data retention", value: "Embeddings: 4 yrs · Logs: 1 yr" },
          { label: "Student consent", value: "Required for enrollment", type: "switch" },
        ]} />
        <Group title="Camera & Stream" fields={[
          { label: "Default FPS", value: "30" },
          { label: "Stream resolution", value: "1080p" },
          { label: "Reconnect retry", value: "5 attempts / 10s backoff" },
        ]} />
        <Group title="Backup" fields={[
          { label: "Automatic DB backup", value: "Daily 02:00 AM", type: "switch" },
          { label: "Retention", value: "30 daily · 12 monthly" },
          { label: "Export history", value: "Last 90 days available" },
        ]} />
      </div>
    </div>
  );
}
