export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "STUDENT" | string;
  permissions?: string[];
  student_id?: string | null;
};

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveAuthSession(data: any) {
  const token = data?.access_token || data?.accessToken || data?.token;
  const user = data?.user;

  if (!token) {
    throw new Error("Login response missing token");
  }

  localStorage.setItem("token", token);

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.role || "");
    localStorage.setItem("student_id", user.student_id || "");
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("student_id");
}

export function requireStudentId() {
  const user = getAuthUser();
  return user?.student_id || localStorage.getItem("student_id") || "";
}
