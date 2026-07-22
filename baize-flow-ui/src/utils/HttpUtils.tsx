import request, { ApiResponse } from "@/utils/request";

class HttpUtils {
  public static async post<T>(
    url: string,
    body?: Record<string, any>,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(url, {
      method: "POST",
      data: body,
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
  }

  public static async postForm<T>(
    url: string,
    formData: FormData,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(url, {
      method: "POST",
      data: formData,
      ...options,
    });
  }

  public static async request<T>(
    url: string,
    method: string,
    body?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(url, {
      method,
      data: body,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public static async get<T>(
    url: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
  }

  public static async put<T>(
    url: string,
    body?: Record<string, any>,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(url, {
      method: "PUT",
      data: body,
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
  }

  public static async delete<T>(
    url: string,
    data?: Record<string, any>,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return request<ApiResponse<T>>(url, {
      method: "DELETE",
      data,
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
  }

  public static async download(
    url: string,
    options?: Record<string, any>
  ): Promise<any> {
    return request(url, {
      method: "GET",
      responseType: "blob",
      getResponse: true,
      ...(options || {}),
    });
  }
}

export default HttpUtils;
export type { ApiResponse };