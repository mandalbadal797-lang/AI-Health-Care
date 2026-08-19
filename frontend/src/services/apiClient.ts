import { APIErrorResponse } from '../types/api';

const BASE_URL = typeof window !== 'undefined' && window.location.origin ? `${window.location.origin}/api/v1` : 'http://127.0.0.1:8000/api/v1';

class APIClient {
  private getHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = localStorage.getItem('mindcampus_admin_token') || localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  async get<T>(endpoint: string, options?: { params?: Record<string, string | number>; headers?: Record<string, string> }): Promise<T> {
    try {
      let url = `${BASE_URL}${endpoint}`;
      if (options?.params && Object.keys(options.params).length > 0) {
        const query = new URLSearchParams();
        Object.entries(options.params).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            query.append(key, String(val));
          }
        });
        url += url.includes('?') ? `&${query.toString()}` : `?${query.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(options?.headers),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        const errorData = data as APIErrorResponse;
        throw new Error(errorData.error?.message || `HTTP ${response.status} Request Failed`);
      }

      return data as T;
    } catch (err: any) {
      console.error(`[APIClient GET ${endpoint}] Error:`, err);
      throw err;
    }
  }

  async post<T>(endpoint: string, body?: any, options?: { headers?: Record<string, string> }): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        const errorData = data as APIErrorResponse;
        throw new Error(errorData.error?.message || `HTTP ${response.status} Request Failed`);
      }

      return data as T;
    } catch (err: any) {
      console.error(`[APIClient POST ${endpoint}] Error:`, err);
      throw err;
    }
  }

  async put<T>(endpoint: string, body?: any, options?: { headers?: Record<string, string> }): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        const errorData = data as APIErrorResponse;
        throw new Error(errorData.error?.message || `HTTP ${response.status} Request Failed`);
      }

      return data as T;
    } catch (err: any) {
      console.error(`[APIClient PUT ${endpoint}] Error:`, err);
      throw err;
    }
  }

  async patch<T>(endpoint: string, body?: any, options?: { headers?: Record<string, string> }): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        const errorData = data as APIErrorResponse;
        throw new Error(errorData.error?.message || `HTTP ${response.status} Request Failed`);
      }

      return data as T;
    } catch (err: any) {
      console.error(`[APIClient PATCH ${endpoint}] Error:`, err);
      throw err;
    }
  }

  async delete<T>(endpoint: string, options?: { headers?: Record<string, string> }): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(options?.headers),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        const errorData = data as APIErrorResponse;
        throw new Error(errorData.error?.message || `HTTP ${response.status} Request Failed`);
      }

      return data as T;
    } catch (err: any) {
      console.error(`[APIClient DELETE ${endpoint}] Error:`, err);
      throw err;
    }
  }
}

export const apiClient = new APIClient();
