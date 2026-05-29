import { apiRequest } from "@/lib/api";

export async function getAiInsightsApi(params?: { severity?: string }) {
  const query = new URLSearchParams();

  if (params?.severity) query.set("severity", params.severity);

  const qs = query.toString();

  return apiRequest(`/ai/insights${qs ? `?${qs}` : ""}`);
}

export async function generateAiRecommendationsApi() {
  return apiRequest("/ai/recommendations/generate", {
    method: "POST",
  });
}

export async function askAiAssistantApi(message: string) {
  return apiRequest("/ai/assistant", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function analyzeFaceApi(payload: {
  student_id?: string;
  image_url?: string;
}) {
  return apiRequest("/ai/face/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function generateLowAttendanceRiskApi() {
  return apiRequest("/ai/attendance/low-risk/generate", {
    method: "POST",
  });
}