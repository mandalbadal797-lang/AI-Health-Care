export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
}

export interface APIErrorDetail {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: APIErrorDetail[];
}

export interface APIErrorResponse {
  success: false;
  error: APIError;
}

export interface HealthData {
  status: string;
  app_name: string;
  environment: string;
  version: string;
  database_connected: boolean;
}

export type HealthResponse = APIResponse<HealthData>;
