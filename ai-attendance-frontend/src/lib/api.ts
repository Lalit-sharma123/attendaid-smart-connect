// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// type ApiOptions = RequestInit & {
//   skipAuth?: boolean;
// };

// function buildErrorMessage(data: any) {
//   if (!data) return "Something went wrong";

//   if (Array.isArray(data?.detail)) {
//     return data.detail
//       .map((e: any) => {
//         const field = Array.isArray(e.loc) ? e.loc.join(".") : "field";
//         return `${field}: ${e.msg}`;
//       })
//       .join(", ");
//   }

//   if (typeof data?.detail === "string") {
//     return data.detail;
//   }

//   if (typeof data?.detail === "object") {
//     return JSON.stringify(data.detail);
//   }

//   if (typeof data?.message === "string") {
//     return data.message;
//   }

//   if (typeof data === "string") {
//     return data;
//   }

//   return JSON.stringify(data);
// }

// export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
//   const token = localStorage.getItem("token");

//   const isFormData = options.body instanceof FormData;

//   const headers: HeadersInit = {
//     ...(isFormData ? {} : { "Content-Type": "application/json" }),
//     ...(options.headers || {}),
//   };

//   if (token && !options.skipAuth) {
//     headers.Authorization = `Bearer ${token}`;
//   }

//   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//     ...options,
//     headers,
//   });

//   const contentType = response.headers.get("content-type");

//   let data: any = null;

//   if (contentType?.includes("application/json")) {
//     data = await response.json().catch(() => null);
//   } else {
//     data = await response.text().catch(() => null);
//   }

//   if (!response.ok) {
//     throw new Error(buildErrorMessage(data));
//   }

//   return data;
// }

// export function getBackendBaseUrl() {
//   return API_BASE_URL.replace("/api", "");
// }




const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

type ApiOptions = RequestInit & {
  skipAuth?: boolean;
};

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};

  if (headers instanceof Headers) {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers as Record<string, string>;
}

function buildErrorMessage(data: any) {
  if (!data) return "Something went wrong";

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((e: any) => {
        const field = Array.isArray(e.loc) ? e.loc.join(".") : "field";
        return `${field}: ${e.msg}`;
      })
      .join(", ");
  }

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.detail === "object") {
    return JSON.stringify(data.detail);
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data === "string") {
    return data;
  }

  return JSON.stringify(data);
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const token = localStorage.getItem("token");

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...normalizeHeaders(options.headers),
  };

  if (token && !options.skipAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");

  let data: any = null;

  if (contentType?.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    throw new Error(`${endpoint}: ${buildErrorMessage(data)}`);
  }

  return data;
}

export function getBackendBaseUrl() {
  return API_BASE_URL.replace("/api", "");
}