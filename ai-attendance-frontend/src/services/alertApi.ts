import { apiRequest } from "@/lib/api";

export type AlertAdmin = {
  id: string;
  email: string;
  phone?: string | null;
  role?: string;
};

export async function getAlertsApi(params?: {
  type?: string;
  status?: string;
  severity?: string;
}) {
  const query = new URLSearchParams();

  if (params?.type) query.set("type", params.type);
  if (params?.status) query.set("status", params.status);
  if (params?.severity) query.set("severity", params.severity);

  const qs = query.toString();

  return apiRequest(`/admin/alerts${qs ? `?${qs}` : ""}`);
}

export async function getAlertAdminsApi() {
  return apiRequest("/admin/alerts/admins");
}

export async function getAlertByIdApi(alertId: string) {
  return apiRequest(`/admin/alerts/${alertId}`);
}

export async function updateAlertApi(
  alertId: string,
  payload: {
    status?: string;
    assigned_to_user_id?: string;
    resolved_by_user_id?: string;
    metadata?: Record<string, unknown>;
  }
) {
  return apiRequest(`/admin/alerts/${alertId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function resolveAlertApi(alertId: string) {
  return updateAlertApi(alertId, {
    status: "RESOLVED",
  });
}

export async function assignAlertApi(alertId: string, adminUserId: string) {
  return updateAlertApi(alertId, {
    status: "IN_PROGRESS",
    assigned_to_user_id: adminUserId,
  });
}
