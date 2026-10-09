export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];
  public readonly fieldErrors: Record<string, string>;

  constructor(status: number, code: string, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.fieldErrors = {};

    if (details && Array.isArray(details)) {
      for (const d of details) {
        if (d.field) {
          this.fieldErrors[d.field] = d.message;
        }
      }
    }
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

type OnUnauthorizedCallback = () => void;
let unauthorizedListener: OnUnauthorizedCallback | null = null;

export function setUnauthorizedListener(cb: OnUnauthorizedCallback | null) {
  unauthorizedListener = cb;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Cannot connect to server. Please ensure the backend is running.");
  }

  if (response.status === 401) {
    if (unauthorizedListener) {
      unauthorizedListener();
    }
  }

  let data: unknown;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorObj = data && typeof data === "object" && "error" in data
      ? (data as { error: { code?: string; message?: string; details?: ApiErrorDetail[] } }).error
      : null;

    const code = errorObj?.code || `HTTP_${response.status}`;
    const message = errorObj?.message || response.statusText || "Request failed";
    const details = errorObj?.details;

    throw new ApiError(response.status, code, message, details);
  }

  return data as T;
}
