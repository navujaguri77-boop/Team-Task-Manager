"use client"

import React, { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import { dashboardService, DashboardStats } from "@/services/dashboard"
import { projectService, Project } from "@/services/projects"
import { taskService, Task } from "@/services/tasks"
import { CardSkeleton, SkeletonLoader } from "@/components/SkeletonLoader"
import { AlertCircle, CheckCircle2, Zap, TrendingUp } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, tasksData, projectsData] = await Promise.all([
          dashboardService.getStats(),
          taskService.getUserTasks(),
          projectService.getProjects(),
        ])

        setStats(statsData)
        setRecentTasks(tasksData.slice(0, 5))
        setProjects(projectsData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statCards = [
    {
      label: "Total Projects",
      value: stats?.total_projects || 0,
      icon: "📁",
      color: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "Total Tasks",
      value: stats?.total_tasks || 0,
      icon: "✓",
      color: "bg-purple-100 dark:bg-purple-900",
    },
    {
      label: "Completed",
      value: stats?.completed_tasks || 0,
      icon: "✓✓",
      color: "bg-success/10",
    },
    {
      label: "Overdue",
      value: stats?.overdue_tasks || 0,
      icon: "⏰",
      color: "bg-danger/10",
    },
  ]

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            statCards.map((card, i) => (
              <div key={i} className={`card ${card.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.label}</p>
                    <p className="text-3xl font-jakarta font-bold">{card.value}</p>
                  </div>
                  <span className="text-4xl opacity-30">{card.icon}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="lg:col-span-2 card">
            <h3 className="text-lg font-jakarta font-bold mb-4">My Recent Tasks</h3>
            {loading ? (
              <SkeletonLoader />
            ) : recentTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No tasks yet</p>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border border-gray-100 dark:border-gray-700"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        task.status === "done"
                          ? "bg-success"
                          : task.priority === "high"
                          ? "bg-danger"
                          : "bg-warning"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Status:{" "}
                        <span className="capitalize">
                          {task.status.replace(/_/g, " ")}
                        </span>
                      </p>
                    </div>
                    {task.priority === "high" && (
                      <span className="px-2 py-1 bg-danger/10 text-danger text-xs rounded font-medium">
                        High
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Progress */}
          <div className="card">
            <h3 className="text-lg font-jakarta font-bold mb-4">Project Progress</h3>
            {loading ? (
              <SkeletonLoader />
            ) : projects.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No projects</p>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {project.completed_task_count}/{project.task_count}
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Link href="/projects" className="btn-primary">
            Create New Project
          </Link>
          <Link href="/tasks" className="btn-secondary">
            View All Tasks
          </Link>
        </div>
      </div>
    </Layout>
  )
}
