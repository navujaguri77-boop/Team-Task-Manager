import { apiClient } from "./api"

export interface DashboardStats {
  total_projects: number
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/api/dashboard/stats")
    return response.data
  },
}
