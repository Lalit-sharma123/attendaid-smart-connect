import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { getAuditLogsApi } from "@/services/auditApi";
import { Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/audit")({
  component: Audit,
  head: () => ({ meta: [{ title: "Audit Logs — SmartAttend" }] }),
});

type UiAudit = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  severity: string;
  time: string;
  detail: string;
};

function mapAudit(a: any): UiAudit {
  return {
    id: a.id,
    actor: a.actor?.email || a.actorEmail || a.actorUserId || "System",
    action: a.action || "-",
    entity: a.entityType || a.entity || "-",
    severity: a.severity || "INFO",
    time: a.createdAt || a.created_at || "-",
    detail:
      a.metadata?.detail ||
      a.metadata?.message ||
      a.detail ||
      (typeof a.newValue === "string" ? a.newValue : JSON.stringify(a.newValue || "")) ||
      (typeof a.oldValue === "string" ? a.oldValue : JSON.stringify(a.oldValue || "")) ||
      "Audit event recorded",
  };
}

function Audit() {
  const [list, setList] = useState<UiAudit[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadLogs() {
    setLoading(true);

    try {
      const data = await getAuditLogsApi();
      const rows = Array.isArray(data) ? data : data?.items || [];
      setList(rows.map(mapAudit));
    } catch (error: any) {
      toast.error(error.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();

    const timer = window.setInterval(() => {
      loadLogs();
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;

    return list.filter((a) =>
      [a.actor, a.action, a.entity, a.severity, a.detail]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [list, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">
            Real backend audit trail{loading ? " · loading..." : ""}
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"
        >
          <RefreshCw className="size-4" /> Refresh
        </button>
      </div>

      <SectionCard>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search audit logs..."
            className="w-full h-9 pl-9 pr-3 rounded-md bg-secondary/60 outline-none text-sm focus:bg-card focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-secondary/30">
              <tr className="text-left">
                <th className="px-5 py-2.5 font-medium">Time</th>
                <th className="px-5 py-2.5 font-medium">Actor</th>
                <th className="px-5 py-2.5 font-medium">Action</th>
                <th className="px-5 py-2.5 font-medium">Entity</th>
                <th className="px-5 py-2.5 font-medium">Severity</th>
                <th className="px-5 py-2.5 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t hover:bg-secondary/30">
                  <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {a.time}
                  </td>
                  <td className="px-5 py-3">{a.actor}</td>
                  <td className="px-5 py-3 font-mono text-xs">{a.action}</td>
                  <td className="px-5 py-3">{a.entity}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={a.severity} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{a.detail}</td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-sm text-muted-foreground"
                  >
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
