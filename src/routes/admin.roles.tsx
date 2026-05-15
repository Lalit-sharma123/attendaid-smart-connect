import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SectionCard } from "@/components/ui-kit";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/admin/roles")({
  component: Roles,
  head: () => ({ meta: [{ title: "User Roles — SmartAttend" }] }),
});

const roles = ["Super Admin", "Admin", "Teacher", "Student", "Viewer"];
const perms = [
  "View Dashboard", "Manage Students", "Enroll Faces", "Edit Attendance",
  "Manage Cameras", "View Audit Logs", "Export Reports", "System Settings",
];
const initialMatrix: Record<string, boolean[]> = {
  "Super Admin": [true, true, true, true, true, true, true, true],
  "Admin":       [true, true, true, true, true, true, true, false],
  "Teacher":     [true, false, true, true, false, false, true, false],
  "Student":     [false, false, false, false, false, false, false, false],
  "Viewer":      [true, false, false, false, false, true, true, false],
};

const initialUsers = [
  { name: "Dr. A. Mehra", email: "amehra@uni.edu", role: "Super Admin", status: "Active" },
  { name: "Prof. R. Iyer", email: "riyer@uni.edu", role: "Admin", status: "Active" },
  { name: "Ms. S. Kapoor", email: "skapoor@uni.edu", role: "Teacher", status: "Active" },
  { name: "Mr. P. Banerjee", email: "pbanerjee@uni.edu", role: "Viewer", status: "Disabled" },
];

function Roles() {
  const [matrix, setMatrix] = useState(initialMatrix);
  const [users, setUsers] = useState(initialUsers);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Admin" });
  const [disabling, setDisabling] = useState<typeof initialUsers[number] | null>(null);
  const [resetting, setResetting] = useState<typeof initialUsers[number] | null>(null);
  const [assigning, setAssigning] = useState<typeof initialUsers[number] | null>(null);

  const toggle = (role: string, idx: number) => {
    setMatrix((m) => ({ ...m, [role]: m[role].map((v, i) => i === idx ? !v : v) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Roles &amp; Permissions</h1>
          <p className="text-sm text-muted-foreground">Granular role-based access control with permission matrix.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { toast.success("Permissions saved"); }} className="h-9 px-3 rounded-md border text-sm">Save Permissions</button>
          <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Plus className="size-4" /> Create User</button>
        </div>
      </div>

      <SectionCard title="Permission Matrix">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="text-left">
                <th className="px-5 py-2.5 font-medium">Permission</th>
                {roles.map((r) => <th key={r} className="px-3 py-2.5 font-medium text-center">{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {perms.map((p, i) => (
                <tr key={p} className="border-t">
                  <td className="px-5 py-3">{p}</td>
                  {roles.map((r) => (
                    <td key={r} className="px-3 py-3 text-center">
                      <button onClick={() => toggle(r, i)} className="inline-flex items-center justify-center size-6 rounded hover:bg-secondary">
                        {matrix[r][i] ? <Check className="size-4 text-success" /> : <X className="size-4 text-muted-foreground/40" />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Users">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-secondary/30">
              <tr className="text-left">
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Email</th>
                <th className="px-5 py-2.5 font-medium">Role</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-t">
                  <td className="px-5 py-3 font-medium">{u.name}</td>
                  <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{u.email}</td>
                  <td className="px-5 py-3"><span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-medium">{u.role}</span></td>
                  <td className="px-5 py-3"><span className={`text-xs ${u.status === "Active" ? "text-success" : "text-muted-foreground"}`}>● {u.status}</span></td>
                  <td className="px-5 py-3 text-right text-xs space-x-3">
                    <button onClick={() => setResetting(u)} className="text-primary">Reset Password</button>
                    <button onClick={() => setAssigning(u)} className="text-primary">Assign Role</button>
                    <button onClick={() => setDisabling(u)} className="text-destructive">{u.status === "Active" ? "Disable" : "Enable"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create User</DialogTitle><DialogDescription>Add a new admin or teacher account.</DialogDescription></DialogHeader>
          <div className="space-y-3 text-sm">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full h-9 px-3 rounded-md border bg-card" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full h-9 px-3 rounded-md border bg-card" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full h-9 px-3 rounded-md border bg-card">
              {roles.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <DialogFooter>
            <button onClick={() => {
              if (!form.name || !form.email) { toast.error("Name and email required"); return; }
              setUsers((p) => [...p, { ...form, status: "Active" }]); toast.success("User created"); setCreateOpen(false); setForm({ name: "", email: "", role: "Admin" });
            }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Create</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assigning} onOpenChange={(o) => !o && setAssigning(null)}>
        <DialogContent className="max-w-sm">
          {assigning && (
            <>
              <DialogHeader><DialogTitle>Assign role · {assigning.name}</DialogTitle></DialogHeader>
              <div className="space-y-2">
                {roles.map((r) => (
                  <button key={r} onClick={() => { setUsers((p) => p.map((u) => u.email === assigning.email ? { ...u, role: r } : u)); toast.success(`Role: ${r}`); setAssigning(null); }} className="w-full p-2.5 rounded-md border text-sm text-left hover:bg-secondary">{r}</button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!resetting} onOpenChange={(o) => !o && setResetting(null)}
        title={`Reset password for ${resetting?.name}?`} description="A reset email will be sent."
        confirmLabel="Send reset" onConfirm={() => { toast.success("Reset email sent"); setResetting(null); }} />
      <ConfirmDialog open={!!disabling} onOpenChange={(o) => !o && setDisabling(null)}
        title={disabling?.status === "Active" ? `Disable ${disabling?.name}?` : `Enable ${disabling?.name}?`}
        confirmLabel={disabling?.status === "Active" ? "Disable" : "Enable"}
        destructive={disabling?.status === "Active"}
        onConfirm={() => { setUsers((p) => p.map((u) => u.email === disabling!.email ? { ...u, status: u.status === "Active" ? "Disabled" : "Active" } : u)); toast.success("Updated"); setDisabling(null); }} />
    </div>
  );
}
