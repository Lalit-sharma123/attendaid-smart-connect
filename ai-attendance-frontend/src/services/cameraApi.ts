import { apiRequest } from "@/lib/api";

export async function getCamerasApi(params?: {
  status?: string;
  enabled?: boolean;
}) {
  const query = new URLSearchParams();

  if (params?.status) query.set("status", params.status);
  if (params?.enabled !== undefined) {
    query.set("enabled", String(params.enabled));
  }

  const qs = query.toString();

  return apiRequest(`/admin/cameras${qs ? `?${qs}` : ""}`);
}

export async function createCameraApi(payload: {
  name: string;
  location: string;
  rtsp_url_encrypted?: string;
  masked_rtsp_url?: string;
  assigned_class_id?: string;
  assigned_section_id?: string;
  enabled?: boolean;
}) {
  return apiRequest("/admin/cameras", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCameraApi(
  cameraId: string,
  payload: {
    name?: string;
    location?: string;
    rtsp_url_encrypted?: string;
    masked_rtsp_url?: string;
    assigned_class_id?: string;
    assigned_section_id?: string;
    enabled?: boolean;
    status?: string;
  }
) {
  return apiRequest(`/admin/cameras/${cameraId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCameraApi(cameraId: string) {
  return apiRequest(`/admin/cameras/${cameraId}`, {
    method: "DELETE",
  });
}

export async function addCameraHeartbeatApi(
  cameraId: string,
  payload: {
    status: string;
    fps?: number;
    latency_ms?: number;
    cpu_usage?: number;
    gpu_usage?: number;
    ram_usage?: number;
  }
) {
  return apiRequest(`/admin/cameras/${cameraId}/heartbeat`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getRecognitionEventsApi() {
  return apiRequest("/admin/cameras/recognition-events/list");
}

export async function getUnknownFacesApi() {
  return apiRequest("/admin/cameras/unknown-faces/list");
}

export async function getSpoofAttemptsApi() {
  return apiRequest("/admin/cameras/spoof-attempts/list");
}