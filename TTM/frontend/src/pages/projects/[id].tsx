"use client"

import React, { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import { useParams } from "next/navigation"
import { projectService, Project } from "@/services/projects"
import { taskService, Task } from "@/services/tasks"
import { Modal } from "@/components/Modal"
import { SkeletonLoader } from "@/components/SkeletonLoader"
import { Trash2, Plus } from "lucide-react"
import toast from "react-hot-toast"

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = parseInt(params.id as string)

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"board" | "members">("board")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignee_id: "",
    due_date: "",
  })

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const [projectData, tasksData] = await Promise.all([
        projectService.getProject(projectId),
        taskService.getProjectTasks(projectId),
      ])
      setProject(projectData)
      setTasks(tasksData)
    } catch (error) {
      toast.error("Failed to fetch project")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await taskService.createTask(projectId, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority as any,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : undefined,
        due_date: formData.due_date || undefined,
      })
      toast.success("Task created successfully!")
      setModalOpen(false)
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        assignee_id: "",
        due_date: "",
      })
      fetchProject()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create task")
    }
  }

  const handleTaskStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus as any)
      toast.success("Task updated!")
      fetchProject()
    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  const kanbanColumns = [
    { id: "to_do", label: "To Do", color: "bg-gray-100 dark:bg-gray-700" },
    { id: "in_progress", label: "In Progress", color: "bg-blue-100 dark:bg-blue-900" },
    { id: "in_review", label: "In Review", color: "bg-purple-100 dark:bg-purple-900" },
    { id: "done", label: "Done", color: "bg-success/10" },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="p-6 space-y-4">
          <SkeletonLoader className="h-8 w-1/3" />
          <SkeletonLoader className="h-4 w-full" />
        </div>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-error">Project not found</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-jakarta font-bold mb-2">{project.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-3 py-1 rounded text-xs font-medium capitalize ${
                project.status === "active"
                  ? "bg-success/10 text-success"
                  : project.status === "completed"
                  ? "bg-primary/10 text-primary"
                  : "bg-warning/10 text-warning"
              }`}>
                {project.status.replace(/_/g, " ")}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {project.completed_task_count}/{project.task_count} tasks complete
              </span>
            </div>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={18} className="mr-2 inline" />
            Add Task
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 flex gap-4">
          <button
            onClick={() => setActiveTab("board")}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === "board"
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === "members"
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            Members ({project.members.length})
          </button>
        </div>

        {/* Board */}
        {activeTab === "board" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kanbanColumns.map((column) => (
              <div key={column.id} className={`${column.color} rounded-lg p-4 min-h-[500px]`}>
                <h3 className="font-jakarta font-bold mb-4">{column.label}</h3>
                <div className="space-y-3">
                  {tasks
                    .filter((t) => t.status === column.id)
                    .map((task) => (
                      <div key={task.id} className="card cursor-move hover:shadow-md transition-shadow">
                        <p className="font-medium text-sm mb-2">{task.title}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded ${
                            task.priority === "high"
                              ? "bg-danger/10 text-danger"
                              : task.priority === "medium"
                              ? "bg-warning/10 text-warning"
                              : "bg-success/10 text-success"
                          }`}>
                            {task.priority}
                          </span>
                          <select
                            value={task.status}
                            onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                            className="text-xs bg-transparent border-none cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="to_do">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="in_review">In Review</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Members */}
        {activeTab === "members" && (
          <div className="card">
            <h3 className="font-jakarta font-bold mb-4">Project Members</h3>
            <div className="space-y-3">
              {project.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded capitalize">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              placeholder="Task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Assign To</label>
              <select
                value={formData.assignee_id}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                className="input"
              >
                <option value="">Unassigned</option>
                {project.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Create Task
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
