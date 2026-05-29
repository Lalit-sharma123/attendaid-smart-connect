import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";
import { getAuthUser, requireStudentId } from "@/lib/auth";

export const Route = createFileRoute("/student/profile")({
  component: StudentProfile,
});

function StudentProfile() {
  const authUser = getAuthUser();
  const studentId = requireStudentId();

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(studentId));
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!studentId) {
        setLoading(false);
        setError("No student profile is linked with this login.");
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await apiRequest(`/admin/students/${studentId}`);
        setStudent(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load student profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [studentId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">Loading profile...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-destructive">{error}</CardContent>
      </Card>
    );
  }

  const name = student?.name || authUser?.email || "Student";
  const rollNo = student?.rollNo || student?.roll_no || "-";
  const email = student?.user?.email || authUser?.email || "-";
  const phone = student?.user?.phone || student?.phone || "-";
  const department = student?.department?.name || student?.department || "-";
  const className = student?.courseClass?.name || student?.class?.name || student?.class || "-";
  const section = student?.section?.name || student?.section || "-";
  const status = student?.status || "ACTIVE";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
            {String(name).slice(0, 1).toUpperCase()}
          </div>

          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-semibold">{name}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Roll No</div>
              <div className="font-semibold">{rollNo}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-semibold">{email}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="font-semibold">{phone}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Department</div>
              <div className="font-semibold">{department}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Class</div>
              <div className="font-semibold">{className}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Section</div>
              <div className="font-semibold">{section}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge>{String(status)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
