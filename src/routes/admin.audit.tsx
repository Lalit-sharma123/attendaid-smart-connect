import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import { auditLogs } from "@/lib/mock-data";
import { Filter, Download } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { downloadCSV } from "@/lib/csv";

export const Route = createFileRoute("/admin/audit")({
  component: Audit,
  head: () => ({ meta: [{ title: "Audit Logs — SmartAttend" }] }),
});

function Audit() {
  const all = useMemo(() => [...auditLogs, ...auditLogs].map((l, i) => ({ ...l, _id: i })), []);
  const [adminFilter, setAdminFilter] = useState("All");
  const [sevFilter, setSevFilter] = useState("All");
  const [viewing, setViewing] = useState<typeof all[number] | null>(null);

  const filtered = all.filter((l) =>
    (adminFilter === "All" || l.admin === adminFilter) &&
    (sevFilter === "All" || l.severity === sevFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">Immutable record of all admin actions and security events.</p>
        </div>
        <button onClick={() => { downloadCSV(`audit-${Date.now()}.csv`, filtered.map(({ _id, ...l }) => l)); toast.success("Audit CSV downloaded"); }} className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Download className="size-4" /> Export CSV</button>
      </div>

      <SectionCard>
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={adminFilter} onChange={(e) => setAdminFilter(e.target.value)} className="h-9 px-3 rounded-md border text-xs bg-card">
            <option>All</option><option>admin@uni.edu</option><option>supervisor@uni.edu</option>
          </select>
          <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value)} className="h-9 px-3 rounded-md border text-xs bg-card">
            {["All", "Low", "Medium", "High", "Info"].map((s) => <option key={s}>{s}</option>)}
          </select>
          {["Action: All", "Date: Today"].map((f) => (
            <button key={f} onClick={() => toast(f)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border text-xs hover:bg-secondary"><Filter className="size-3" /> {f}</button>
          ))}
          <button onClick={() => { setAdminFilter("All"); setSevFilter("All"); toast("Filters cleared"); }} className="ml-auto h-9 px-3 rounded-md border text-xs hover:bg-secondary">Clear Filters</button>
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
              {filtered.map((l) => (
                <tr key={l._id} onClick={() => setViewing(l)} className="border-t hover:bg-secondary/30 cursor-pointer">
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

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-md">
          {viewing && (
            <>
              <DialogHeader><DialogTitle>{viewing.action}</DialogTitle><DialogDescription>{viewing.time} · {viewing.admin}</DialogDescription></DialogHeader>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Target</span><span className="font-medium">{viewing.target}</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Reason</span><span>{viewing.reason}</span></div>
                <div className="flex justify-between p-2.5 rounded bg-secondary/50"><span>Severity</span><StatusBadge status={viewing.severity} /></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
