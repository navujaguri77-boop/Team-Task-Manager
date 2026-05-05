import { apiClient } from "./api"

export interface Task {
  id: number
  project_id: number
  title: string
  description?: string
  status: "to_do" | "in_progress" | "in_review" | "done"
  priority: "low" | "medium" | "high"
  assignee_id?: number
  assignee?: { id: number; name: string; email: string; avatar_url?: string }
  created_by: number
  creator?: { id: number; name: string; email: string }
  due_date?: string
  created_at: string
  updated_at: string
}

export interface TaskCreateRequest {
  title: string
  description?: string
  priority?: "low" | "medium" | "high"
  assignee_id?: number
  due_date?: string
  status?: "to_do" | "in_progress" | "in_review" | "done"
}

export interface TaskUpdateRequest extends TaskCreateRequest {}

export const taskService = {
  getUserTasks: async (): Promise<Task[]> => {
    const response = await apiClient.get("/api/tasks")
    return response.data
  },

  getTask: async (taskId: number): Promise<Task> => {
    const response = await apiClient.get(`/api/tasks/${taskId}`)
    return response.data
  },

  getProjectTasks: async (projectId: number): Promise<Task[]> => {
    const response = await apiClient.get(`/api/projects/${projectId}/tasks`)
    return response.data
  },

  createTask: async (projectId: number, data: TaskCreateRequest): Promise<Task> => {
    const response = await apiClient.post(`/api/projects/${projectId}/tasks`, data)
    return response.data
  },

  updateTask: async (taskId: number, data: TaskUpdateRequest): Promise<Task> => {
    const response = await apiClient.put(`/api/tasks/${taskId}`, data)
    return response.data
  },

  updateTaskStatus: async (
    taskId: number,
    status: "to_do" | "in_progress" | "in_review" | "done"
  ): Promise<Task> => {
    const response = await apiClient.patch(`/api/tasks/${taskId}/status`, { status })
    return response.data
  },

  deleteTask: async (taskId: number): Promise<void> => {
    await apiClient.delete(`/api/tasks/${taskId}`)
  },
}
