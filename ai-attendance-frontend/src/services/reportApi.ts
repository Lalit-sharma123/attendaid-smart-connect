import { apiRequest } from "@/lib/api";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function buildQuery(params?: QueryParams) {
  if (!params) return "";

  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getReportsApi(params?: QueryParams) {
  return apiRequest(`/attendance/records${buildQuery(params)}`);
}

export async function getReportSummaryApi(params?: QueryParams) {
  return apiRequest(`/reports/summary${buildQuery(params)}`);
}

export async function getDailyAttendanceReportApi(params?: QueryParams) {
  return apiRequest(`/reports/daily-attendance${buildQuery(params)}`);
}

export async function getMonthlyAttendanceReportApi(params?: QueryParams) {
  return apiRequest(`/reports/monthly-attendance${buildQuery(params)}`);
}

export async function getClassAttendanceReportApi(params?: QueryParams) {
  return apiRequest(`/reports/class-attendance${buildQuery(params)}`);
}

export async function getLowAttendanceRiskReportApi(params?: QueryParams) {
  return apiRequest(`/reports/low-attendance-risk${buildQuery(params)}`);
}

export async function getSpoofAttemptReportApi(params?: QueryParams) {
  return apiRequest(`/reports/spoof-attempts${buildQuery(params)}`);
}

export async function getCameraActivityReportApi(params?: QueryParams) {
  return apiRequest(`/reports/camera-activity${buildQuery(params)}`);
}

export async function exportCsvReportApi() {
  return apiRequest("/attendance/export/csv");
}

export async function exportExcelReportApi() {
  return apiRequest("/attendance/export/excel");
}

export async function exportPdfReportApi() {
  return apiRequest("/attendance/export/pdf");
}