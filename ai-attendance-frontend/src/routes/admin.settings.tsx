import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui-kit";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — SmartAttend" }] }),
});

type Field = { label: string; value: string; type?: "switch" | "text"; key: string };

const initialState: Record<string, boolean | string> = {
  duplicate: true, autoTrain: true, spoofAlert: true, lowAttDigest: true, cameraOffline: true,
  twoFA: true, encryption: true, consent: true, autoBackup: true,
  classStart: "09:00 AM", lateThreshold: "After 09:15 AM (15 min grace)", dedupe: "120 seconds",
  recogConf: "78", livenessThr: "70", model: "ArcFace R100 + Liveness v3",
  fps: "30", res: "1080p", retry: "5 attempts / 10s backoff",
};

function SettingsPage() {
  const [state, setState] = useState(initialState);
  const [resetOpen, setResetOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  useEffect(() => {
    try { const raw = localStorage.getItem("sa-settings"); if (raw) setState((s) => ({ ...s, ...JSON.parse(raw) })); } catch {}
  }, []);

  const save = () => { localStorage.setItem("sa-settings", JSON.stringify(state)); toast.success("Settings saved"); };

  const groups: { title: string; fields: Field[] }[] = [
    { title: "Attendance Rules", fields: [
      { label: "Class start time", value: String(state.classStart), key: "classStart" },
      { label: "Late threshold", value: String(state.lateThreshold), key: "lateThreshold" },
      { label: "Duplicate prevention", value: "1 mark per student per day", key: "duplicate", type: "switch" },
      { label: "Cross-camera dedupe window", value: String(state.dedupe), key: "dedupe" },
    ]},
    { title: "AI Thresholds", fields: [
      { label: "Recognition confidence", value: `Minimum ${state.recogConf}%`, key: "recogConf" },
      { label: "Liveness threshold", value: `Minimum ${state.livenessThr}%`, key: "livenessThr" },
      { label: "Active model", value: String(state.model), key: "model" },
      { label: "Auto re-train weekly", value: "Enabled", key: "autoTrain", type: "switch" },
    ]},
    { title: "Notifications", fields: [
      { label: "Spoof attempt alert", value: "Email + In-app", key: "spoofAlert", type: "switch" },
      { label: "Low attendance digest", value: "Weekly Mondays 09:00", key: "lowAttDigest", type: "switch" },
      { label: "Camera offline alert", value: "Immediate SMS", key: "cameraOffline", type: "switch" },
    ]},
    { title: "Security & Privacy", fields: [
      { label: "Two-factor authentication", value: "Required for admins", key: "twoFA", type: "switch" },
      { label: "Session timeout", value: "30 minutes inactivity", key: "session" },
      { label: "Face embedding encryption", value: "AES-256 at rest", key: "encryption", type: "switch" },
      { label: "Data retention", value: "Embeddings: 4 yrs · Logs: 1 yr", key: "retention" },
      { label: "Student consent", value: "Required for enrollment", key: "consent", type: "switch" },
    ]},
    { title: "Camera & Stream", fields: [
      { label: "Default FPS", value: String(state.fps), key: "fps" },
      { label: "Stream resolution", value: String(state.res), key: "res" },
      { label: "Reconnect retry", value: String(state.retry), key: "retry" },
    ]},
    { title: "Backup", fields: [
      { label: "Automatic DB backup", value: "Daily 02:00 AM", key: "autoBackup", type: "switch" },
      { label: "Retention", value: "30 daily · 12 monthly", key: "bRet" },
      { label: "Export history", value: "Last 90 days available", key: "expHist" },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure attendance rules, AI thresholds, and system policies.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setResetOpen(true)} className="h-9 px-3 rounded-md border text-sm">Reset</button>
          <button onClick={save} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Save Settings</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map((g) => (
          <SectionCard key={g.title} title={g.title}>
            <div className="space-y-1">
              {g.fields.map((f) => (
                <div key={f.label} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <div className="text-sm font-medium">{f.label}</div>
                    <div className="text-xs text-muted-foreground">{f.value}</div>
                  </div>
                  {f.type === "switch" ? (
                    <button onClick={() => setState((s) => ({ ...s, [f.key]: !s[f.key] }))}
                      className={`w-10 h-6 rounded-full relative transition-colors ${state[f.key] ? "bg-primary" : "bg-secondary"}`}>
                      <div className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${state[f.key] ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  ) : (
                    <button onClick={() => setEditingKey(f.key)} className="h-8 px-3 rounded-md bg-secondary text-xs">Edit</button>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>

      <ConfirmDialog open={resetOpen} onOpenChange={setResetOpen}
        title="Reset settings to defaults?" description="All custom configuration will be cleared." confirmLabel="Reset" destructive
        onConfirm={() => { setState(initialState); localStorage.removeItem("sa-settings"); toast.success("Settings reset"); }} />

      {editingKey && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={() => setEditingKey(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-lg border p-5 w-[320px] space-y-3">
            <div className="text-sm font-semibold">Edit value</div>
            <input defaultValue={String(state[editingKey])} onChange={(e) => setState((s) => ({ ...s, [editingKey]: e.target.value }))}
              className="w-full h-9 px-3 rounded-md border bg-card text-sm" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingKey(null)} className="h-9 px-3 rounded-md border text-sm">Cancel</button>
              <button onClick={() => { setEditingKey(null); toast.success("Updated"); }} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
