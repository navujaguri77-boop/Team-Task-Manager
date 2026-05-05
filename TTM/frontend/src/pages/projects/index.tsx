"use client"

import React, { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import { projectService, Project } from "@/services/projects"
import { Modal } from "@/components/Modal"
import { Alert } from "@/components/Alert"
import { CardSkeleton } from "@/components/SkeletonLoader"
import Link from "next/link"
import { useAuthStore } from "@/stores/authStore"
import toast from "react-hot-toast"

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await projectService.getProjects()
      setProjects(data)
    } catch (err) {
      setError("Failed to fetch projects")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await projectService.createProject({
        name: formData.name,
        description: formData.description,
        status: formData.status as any,
      })
      toast.success("Project created successfully!")
      setModalOpen(false)
      setFormData({ name: "", description: "", status: "active" })
      fetchProjects()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create project")
    }
  }

  const filteredProjects = projects.filter((p) => filter === "all" || p.status === filter)

  const isAdmin = user?.role === "admin"

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-jakarta font-bold">Projects</h1>
          {isAdmin && (
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              New Project
            </button>
          )}
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}

        {/* Filter Bar */}
        <div className="flex gap-2">
          {["all", "active", "completed", "on_hold"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {status === "on_hold" ? "On Hold" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No projects found</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="card hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-jakarta font-bold text-lg group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {project.status.replace(/_/g, " ")}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    project.status === "active"
                      ? "bg-success/10 text-success"
                      : project.status === "completed"
                      ? "bg-primary/10 text-primary"
                      : "bg-warning/10 text-warning"
                  }`}>
                    {project.status === "on_hold" ? "On Hold" : project.status}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {project.completed_task_count}/{project.task_count} tasks done
                    </p>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width:
                          project.task_count > 0
                            ? `${(project.completed_task_count / project.task_count) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 -space-x-2">
                  {project.members.slice(0, 3).map((member) => (
                    <div
                      key={member.id}
                      className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary border border-white dark:border-gray-800"
                      title={member.name}
                    >
                      {member.name.charAt(0)}
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="My Project"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              placeholder="Project description..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Create Project
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
