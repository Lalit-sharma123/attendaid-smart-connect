import { apiRequest } from "@/lib/api";

export async function getLiveEventsApi() {
  return apiRequest("/live/events");
}

export async function getLiveSummaryApi() {
  return apiRequest("/live/summary");
}
