import { apiRequest } from "@/lib/api";

export async function getDepartmentsApi() {
  return apiRequest("/admin/departments");
}

export async function createDepartmentApi(payload: {
  name: string;
  code?: string;
}) {
  return apiRequest("/admin/departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createClassApi(payload: {
  name: string;
  code?: string;
  department_id: string;
}) {
  return apiRequest("/admin/classes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createSectionApi(payload: {
  name: string;
  class_id?: string;
  class_room_id?: string;
}) {
  return apiRequest("/admin/sections", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getDashboardSummaryApi() {
  return apiRequest("/admin/dashboard/summary");
}