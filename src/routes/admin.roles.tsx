import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/ui-kit";
import { Plus, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/roles")({
  component: Roles,
  head: () => ({ meta: [{ title: "User Roles — SmartAttend" }] }),
});

const roles = ["Super Admin", "Admin", "Teacher", "Student", "Viewer"];
const perms = [
  "View Dashboard", "Manage Students", "Enroll Faces", "Edit Attendance",
  "Manage Cameras", "View Audit Logs", "Export Reports", "System Settings",
];
const matrix: Record<string, boolean[]> = {
  "Super Admin": [true, true, true, true, true, true, true, true],
  "Admin": [true, true, true, true, true, true, true, false],
  "Teacher": [true, false, true, true, false, false, true, false],
  "Student": [false, false, false, false, false, false, false, false],
  "Viewer": [true, false, false, false, false, true, true, false],
};

const users = [
  { name: "Dr. A. Mehra", email: "amehra@uni.edu", role: "Super Admin", status: "Active" },
  { name: "Prof. R. Iyer", email: "riyer@uni.edu", role: "Admin", status: "Active" },
  { name: "Ms. S. Kapoor", email: "skapoor@uni.edu", role: "Teacher", status: "Active" },
  { name: "Mr. P. Banerjee", email: "pbanerjee@uni.edu", role: "Viewer", status: "Disabled" },
];

function Roles() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Roles &amp; Permissions</h1>
          <p className="text-sm text-muted-foreground">Granular role-based access control with permission matrix.</p>
        </div>
        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"><Plus className="size-4" /> Create User</button>
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
                      {matrix[r][i] ? <Check className="size-4 text-success inline" /> : <X className="size-4 text-muted-foreground/40 inline" />}
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
                    <button className="text-primary">Reset Password</button>
                    <button className="text-primary">Assign Role</button>
                    <button className="text-destructive">Disable</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
