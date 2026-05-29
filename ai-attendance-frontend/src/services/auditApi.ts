import { apiRequest } from "@/lib/api";

export async function getAuditLogsApi(params?: {
  action?: string;
  actor_id?: string;
  entity?: string;
}) {
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const qs = query.toString();

  return apiRequest(`/admin/audit-logs${qs ? `?${qs}` : ""}`);
}
