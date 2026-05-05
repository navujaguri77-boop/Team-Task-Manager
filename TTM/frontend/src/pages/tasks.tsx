"use client"

import React, { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import { taskService, Task } from "@/services/tasks"
import { CardSkeleton } from "@/components/SkeletonLoader"
import { AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await taskService.getUserTasks()
      setTasks(data)
    } catch (error) {
      toast.error("Failed to fetch tasks")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-success/10 text-success"
      case "in_review":
        return "bg-primary/10 text-primary"
      case "in_progress":
        return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-danger"
      case "medium":
        return "text-warning"
      default:
        return "text-success"
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "overdue") {
      return (
        task.due_date &&
        new Date(task.due_date) < new Date() &&
        task.status !== "done"
      )
    }
    if (filter === "today") {
      const today = new Date().toISOString().split("T")[0]
      return task.due_date === today
    }
    if (filter === "this_week") {
      const today = new Date()
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return task.due_date && new Date(task.due_date) <= weekFromNow && new Date(task.due_date) >= today
    }
    if (filter !== "all") {
      return task.priority === filter
    }
    return true
  })

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-jakarta font-bold">My Tasks</h1>

        {/* Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: "all", label: "All" },
            { value: "overdue", label: "Overdue" },
            { value: "today", label: "Today" },
            { value: "this_week", label: "This Week" },
            { value: "high", label: "High Priority" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === option.value
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue =
                task.due_date &&
                new Date(task.due_date) < new Date() &&
                task.status !== "done"

              return (
                <div
                  key={task.id}
                  className="card hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <input type="checkbox" disabled className="w-4 h-4" />
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                          {task.project_id && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                              Project #{task.project_id}
                            </span>
                          )}
                          {task.due_date && (
                            <span
                              className={`px-2 py-1 rounded ${
                                isOverdue ? "bg-danger/10 text-danger" : ""
                              }`}
                            >
                              {isOverdue && <AlertCircle size={12} className="inline mr-1" />}
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)} bg-opacity-10 capitalize`}>
                        {task.priority}
                      </span>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(task.status)} capitalize`}>
                        {task.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Layout>
  )
}
