import axios, { AxiosInstance, AxiosError } from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface ApiResponse<T> {
  data: T
  status: number
}

interface ErrorResponse {
  detail: string | { [key: string]: string[] }
}

class ApiClient {
  private client: AxiosInstance
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.loadTokens()

    // Add interceptor for authentication
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`
      }
      return config
    })

    // Add interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
          originalRequest._retry = true

          try {
            const response = await axios.post(
              `${API_URL}/api/auth/refresh`,
              { refresh_token: this.refreshToken }
            )

            this.setTokens(response.data.access_token, response.data.refresh_token)
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`

            return this.client(originalRequest)
          } catch (err) {
            this.clearTokens()
            window.location.href = "/auth"
            return Promise.reject(err)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private loadTokens() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken")
      this.refreshToken = localStorage.getItem("refreshToken")
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
  }

  clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }

  getAccessToken() {
    return this.accessToken
  }

  async get<T>(url: string) {
    return this.client.get<T>(url)
  }

  async post<T>(url: string, data?: any) {
    return this.client.post<T>(url, data)
  }

  async put<T>(url: string, data?: any) {
    return this.client.put<T>(url, data)
  }

  async patch<T>(url: string, data?: any) {
    return this.client.patch<T>(url, data)
  }

  async delete<T>(url: string) {
    return this.client.delete<T>(url)
  }
}

export const apiClient = new ApiClient()
