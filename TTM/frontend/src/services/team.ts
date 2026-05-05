import { apiClient } from "./api"

export interface TeamMember {
  id: number
  name: string
  email: string
  role: "admin" | "member"
  avatar_url?: string
  created_at: string
  task_count: number
}

export const teamService = {
  getTeam: async (): Promise<TeamMember[]> => {
    const response = await apiClient.get("/api/team")
    return response.data
  },

  updateUserRole: async (userId: number, role: "admin" | "member"): Promise<TeamMember> => {
    const response = await apiClient.put(`/api/team/${userId}/role`, { role })
    return response.data
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/api/team/${userId}`)
  },
}
