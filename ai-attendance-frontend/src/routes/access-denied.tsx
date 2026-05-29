import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldX, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/access-denied")({
  component: AccessDenied,
  head: () => ({ meta: [{ title: "Access Denied — SmartAttend" }] }),
});

function AccessDenied() {
  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto size-20 rounded-full bg-destructive/15 text-destructive grid place-items-center mb-5">
          <ShieldX className="size-10" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Access Denied</h1>
        <p className="text-sm text-muted-foreground mt-2">
          You don't have permission to view this page. Students cannot access the admin portal.
          Please contact your system administrator if you believe this is a mistake.
        </p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">
          <ArrowLeft className="size-4" /> Back to login
        </Link>
      </div>
    </div>
  );
}
