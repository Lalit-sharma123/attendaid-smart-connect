import { apiRequest } from "@/lib/api";

export type FaceTask =
  | "FRONT"
  | "LEFT_15"
  | "RIGHT_15"
  | "UP_10"
  | "DOWN_10"
  | "SMILE";

export type VerifyFaceTaskPayload = {
  student_id: string;
  task: FaceTask;
  image_base64: string;
};

export type VerifyFaceTaskResponse = {
  passed: boolean;
  task: FaceTask;
  face_quality: number;
  quality_score?: number;
  embedding: number[];
  pose?: {
    yaw: number;
    pitch: number;
    roll: number;
  };
  message?: string;
  liveness_verified?: boolean;
  liveness_score?: number;
};

export type SaveFaceEnrollmentPayload = {
  student_id: string;
  embedding: number[];
  face_quality?: number;
  liveness_score?: number;
};

export type MarkFaceAttendancePayload = {
  student_id: string;
  image_base64?: string;
  camera_id?: string;
  session_id?: string;
  recognition_confidence?: number;
  liveness_score?: number;
};

export function verifyFaceTaskApi(payload: VerifyFaceTaskPayload) {
  return apiRequest("/face/enrollment/task", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<VerifyFaceTaskResponse>;
}

export function saveFaceEnrollmentApi(payload: SaveFaceEnrollmentPayload) {
  return apiRequest("/face/enrollment/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function markFaceAttendanceApi(payload: MarkFaceAttendancePayload) {
  return apiRequest("/face/attendance/mark", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}





