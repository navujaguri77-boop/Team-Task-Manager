import { apiClient } from "./api"

export interface Project {
  id: number
  name: string
  description?: string
  status: "active" | "completed" | "on_hold"
  created_by: number
  created_at: string
  members: { id: number; name: string; email: string; role: string; avatar_url?: string }[]
  task_count: number
  completed_task_count: number
}

export interface ProjectCreateRequest {
  name: string
  description?: string
  status?: "active" | "completed" | "on_hold"
}

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get("/api/projects")
    return response.data
  },

  getProject: async (projectId: number): Promise<Project> => {
    const response = await apiClient.get(`/api/projects/${projectId}`)
    return response.data
  },

  createProject: async (data: ProjectCreateRequest): Promise<Project> => {
    const response = await apiClient.post("/api/projects", data)
    return response.data
  },

  updateProject: async (
    projectId: number,
    data: Partial<ProjectCreateRequest>
  ): Promise<Project> => {
    const response = await apiClient.put(`/api/projects/${projectId}`, data)
    return response.data
  },

  deleteProject: async (projectId: number): Promise<void> => {
    await apiClient.delete(`/api/projects/${projectId}`)
  },

  getMembers: async (projectId: number) => {
    const response = await apiClient.get(`/api/projects/${projectId}/members`)
    return response.data
  },

  addMember: async (projectId: number, userId: number): Promise<void> => {
    await apiClient.post(`/api/projects/${projectId}/members`, { user_id: userId })
  },

  removeMember: async (projectId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/api/projects/${projectId}/members/${userId}`)
  },
}
