// import { apiRequest } from "@/lib/api";

// export async function getDashboardSummaryApi() {
//   return apiRequest("/admin/dashboard/summary");
// }

// export async function getDashboardStatsApi() {
//   return apiRequest("/admin/dashboard/stats");
// }


import { apiRequest } from "@/lib/api";

export type DailyAttendancePoint = {
  day: string;
  attendance: number;
  predicted?: number;
};

export type DepartmentAttendancePoint = {
  department: string;
  value: number;
};

export type CameraHealthPoint = {
  name: "Healthy" | "Degraded" | "Offline" | string;
  value: number;
};

export type SpoofAttemptPoint = {
  time: string;
  count: number;
};

export type ClassHeatmapRow = {
  section: string;
  values: number[];
};

export type RecentActivityRow = {
  rollNo: string;
  student: string;
  time: string;
  camera: string;
  confidence: number;
  liveness: number;
  status: string;
};

export type CameraActivityRow = {
  camera?: string;
  cameraName?: string;
  detections?: number;
  avgConfidence?: number;
  avgLiveness?: number;
};

export type AiInsight = {
  type?: string;
  message: string;
};

export type DashboardStats = {
  dailyAttendance: DailyAttendancePoint[];
  departmentAttendance: DepartmentAttendancePoint[];
  cameraHealth: CameraHealthPoint[];
  spoofAttempts: SpoofAttemptPoint[];
  classHeatmap: ClassHeatmapRow[];
  recentActivity: RecentActivityRow[];
  cameraActivity: CameraActivityRow[];
  aiInsights: AiInsight[];
};

export type AiDashboardInsightItem = {
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | string;
  category:
    | "ATTENDANCE"
    | "CAMERA"
    | "FACE_ENROLLMENT"
    | "SECURITY"
    | "SYSTEM"
    | string;
};

export type AiDashboardRecommendation = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | string;
};

export type AiDashboardReport = {
  title: string;
  overview: string;
  attendanceAnalysis: string;
  cameraAnalysis: string;
  faceEnrollmentAnalysis: string;
  securityAnalysis: string;
  nextActions: string[];
};

export type AiDashboardInsightsData = {
  summary: string;
  healthScore: number;
  insights: AiDashboardInsightItem[];
  recommendations: AiDashboardRecommendation[];
  report: AiDashboardReport;
};

export type AiDashboardInsightsResponse = {
  ok: boolean;
  source: "ollama" | "fallback" | string;
  model: string;
  data: AiDashboardInsightsData;
  context?: any;
  error?: string;
  raw?: string;
};

export async function getDashboardSummaryApi() {
  return apiRequest("/admin/dashboard/summary");
}

export async function getDashboardStatsApi(): Promise<DashboardStats> {
  return apiRequest("/admin/dashboard/stats");
}

export async function getAiDashboardInsightsApi(): Promise<AiDashboardInsightsResponse> {
  return apiRequest("/ai/dashboard-insights");
}

export async function getReportSummaryApi() {
  return apiRequest("/reports/summary");
}

export async function getDailyAttendanceReportApi() {
  return apiRequest("/reports/daily-attendance");
}

export async function getClassAttendanceReportApi() {
  return apiRequest("/reports/class-attendance");
}

export async function getLowAttendanceRiskReportApi() {
  return apiRequest("/reports/low-attendance-risk");
}

export async function getSpoofAttemptReportApi() {
  return apiRequest("/reports/spoof-attempts");
}

export async function getCameraActivityReportApi() {
  return apiRequest("/reports/camera-activity");
}