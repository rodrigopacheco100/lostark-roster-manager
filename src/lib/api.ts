import axios from "axios"

async function handleResponse<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await promise
    return data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    if (axios.isAxiosError(error) && error.response?.status) {
      throw new Error(error.response.statusText)
    }
    throw new Error("Connection error")
  }
}

export const httpClient = {
  get: <T>(url: string) => handleResponse<T>(axios.get<T>(url)),
  post: <T>(url: string, data?: unknown) => handleResponse<T>(axios.post<T>(url, data)),
  put: <T>(url: string, data?: unknown) => handleResponse<T>(axios.put<T>(url, data)),
  patch: <T>(url: string, data?: unknown) => handleResponse<T>(axios.patch<T>(url, data)),
  delete: <T>(url: string, data?: unknown) => handleResponse<T>(axios.delete<T>(url, data ? { data } : undefined)),
}
