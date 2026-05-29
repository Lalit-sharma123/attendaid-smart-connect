import { apiRequest } from "@/lib/api";

export type AttendanceRecordFilters = {
  student_id?: string;
  department_id?: string;
  class_id?: string;
  section_id?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  skip?: number;
  take?: number;
};

function buildQuery(params?: Record<string, string | number | boolean | undefined | null>) {
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export async function getAttendanceRecordsApi(params?: AttendanceRecordFilters) {
  const queryParams = { ...(params || {}) };

  // Backend currently expects start_date/end_date.
  // If UI passes only date, use it as both start and end date.
  if (queryParams.date && !queryParams.start_date && !queryParams.end_date) {
    queryParams.start_date = queryParams.date;
    queryParams.end_date = queryParams.date;
    delete queryParams.date;
  }

  return apiRequest(`/attendance/records${buildQuery(queryParams)}`);
}

/**
 * Student self attendance endpoint.
 *
 * IMPORTANT:
 * Backend /attendance/mark currently uses student_required and ignores student_id.
 * So this should be used only when logged in as STUDENT.
 */
export async function markAttendanceApi(payload: {
  session_id?: string;
}) {
  return apiRequest("/attendance/mark", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Admin / AI face-recognition attendance endpoint.
 *
 * Use this after face enrollment / live recognition to create real attendance records.
 */
export async function markFaceAttendanceApi(payload: {
  student_id: string;
  status?: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | string;
  source?: "FACE_RECOGNITION" | "MANUAL" | "QR_CODE" | "RFID" | string;
  recognition_confidence?: number;
  liveness_score?: number;
  camera_id?: string;
  session_id?: string;
}) {
  return apiRequest("/attendance/face/mark", {
    method: "POST",
    body: JSON.stringify({
      status: "PRESENT",
      source: "FACE_RECOGNITION",
      ...payload,
    }),
  });
}

export async function correctAttendanceApi(
  recordId: string,
  payload: {
    status: string;
    reason: string;
  }
) {
  return apiRequest(`/attendance/records/${recordId}/correct`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function exportAttendanceCsvApi(params?: AttendanceRecordFilters) {
  return apiRequest(`/attendance/export/csv${buildQuery(params)}`);
}

export async function exportAttendanceExcelApi(params?: AttendanceRecordFilters) {
  return apiRequest(`/attendance/export/excel${buildQuery(params)}`);
}

export async function exportAttendancePdfApi(params?: AttendanceRecordFilters) {
  return apiRequest(`/attendance/export/pdf${buildQuery(params)}`);
}