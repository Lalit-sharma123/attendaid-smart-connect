import { apiRequest } from "@/lib/api";

export type StudentCreatePayload = {
  name: string;
  email: string;
  password: string;
  roll_no: string;
  department_id: string;
  class_id: string;
  section_id: string;
  contact_phone?: string;
  address?: string;
};

export async function getStudentsApi(params?: {
  search?: string;
  department_id?: string;
  class_id?: string;
  section_id?: string;
  status?: string;
}) {
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const qs = query.toString();

  return apiRequest(`/admin/students${qs ? `?${qs}` : ""}`);
}

export async function createStudentApi(payload: StudentCreatePayload) {
  return apiRequest("/admin/students", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getStudentApi(studentId: string) {
  return apiRequest(`/admin/students/${studentId}`);
}

export async function updateStudentApi(
  studentId: string,
  payload: Partial<StudentCreatePayload>
) {
  return apiRequest(`/admin/students/${studentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteStudentApi(studentId: string) {
  return apiRequest(`/admin/students/${studentId}`, {
    method: "DELETE",
  });
}



