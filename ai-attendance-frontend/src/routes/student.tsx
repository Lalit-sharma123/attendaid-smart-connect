import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/layout/StudentShell";

export const Route = createFileRoute("/student")({
  component: () => <StudentShell />,
});
