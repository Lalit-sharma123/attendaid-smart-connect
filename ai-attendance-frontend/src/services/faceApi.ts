import { apiRequest } from "@/lib/api";

export async function getFaceEnrollmentApi(studentId: string) {
  return apiRequest(`/face/students/${studentId}/enrollment`);
}

export async function uploadFaceSampleApi(studentId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(`/face/students/${studentId}/samples`, {
    method: "POST",
    body: formData,
  });
}