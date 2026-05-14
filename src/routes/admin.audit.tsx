import { createFileRoute } from "@tanstack/react-router";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { auditLogs } from "@/lib/mock-data";
import { Filter, Download } from "lucide-react";

export const Route = createFileRoute("/admin/audit")({
  component: Audit,
  head: () => ({ meta: [{ title: "Audit Logs — SmartAttend" }] }),
});

function Audit() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">Immutable record of all admin actions and security events.</p>
        </div>
        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Download className="size-4" /> Export CSV</button>
      </div>

      <SectionCard>
        <div className="flex flex-wrap gap-2 mb-4">
          {["Admin: All", "Action: All", "Date: Today", "Severity: All"].map((f) => (
            <button key={f} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border text-xs hover:bg-secondary"><Filter className="size-3" /> {f}</button>
          ))}
        </div>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-secondary/30">
              <tr className="text-left">
                <th className="px-5 py-2.5 font-medium">Time</th>
                <th className="px-5 py-2.5 font-medium">Admin</th>
                <th className="px-5 py-2.5 font-medium">Action</th>
                <th className="px-5 py-2.5 font-medium">Target</th>
                <th className="px-5 py-2.5 font-medium">Reason</th>
                <th className="px-5 py-2.5 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody>
              {[...auditLogs, ...auditLogs].map((l, i) => (
                <tr key={i} className="border-t hover:bg-secondary/30">
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">{l.time}</td>
                  <td className="px-5 py-3 font-mono text-xs">{l.admin}</td>
                  <td className="px-5 py-3 font-medium">{l.action}</td>
                  <td className="px-5 py-3">{l.target}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{l.reason}</td>
                  <td className="px-5 py-3"><StatusBadge status={l.severity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
