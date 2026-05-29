import { apiRequest } from "@/lib/api";

export async function getAlertsApi(params?: {
  status?: string;
  severity?: string;
  type?: string;
}) {
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const qs = query.toString();

  return apiRequest(`/admin/alerts${qs ? `?${qs}` : ""}`);
}

export async function updateAlertApi(
  alertId: string,
  payload: {
    status?: string;
    assigned_to_user_id?: string;
  }
) {
  return apiRequest(`/admin/alerts/${alertId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getRolesApi() {
  return apiRequest("/admin/roles");
}

export async function getPermissionsApi() {
  return apiRequest("/admin/roles/permissions");
}

export async function getSettingsApi() {
  return apiRequest("/admin/settings");
}

export async function upsertSettingApi(payload: {
  key: string;
  value: Record<string, any>;
  description?: string;
}) {
  return apiRequest("/admin/settings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSystemHealthSummaryApi() {
  return apiRequest("/admin/system-health/summary");
}

export async function createSystemHealthLogApi(payload: {
  service_name: string;
  status: string;
  cpu_usage?: number;
  ram_usage?: number;
  latency_ms?: number;
}) {
  return apiRequest("/admin/system-health", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}