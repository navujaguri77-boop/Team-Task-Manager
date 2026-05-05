"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { authService, apiClient } from "@/services/auth"
import { LogOut, Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Projects", href: "/projects", icon: "📁" },
  { label: "My Tasks", href: "/tasks", icon: "✓" },
  { label: "Team", href: "/team", icon: "👥", adminOnly: true },
  { label: "Settings", href: "/settings", icon: "⚙️" },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, setUser, setLoading, setAuthenticated, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          setLoading(false)
          if (!["/auth", "/", ""].includes(pathname)) {
            router.push("/auth")
          }
          return
        }

        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
        setAuthenticated(true)
      } catch (error) {
        setUser(null)
        setAuthenticated(false)
        apiClient.clearTokens()
        if (!["/auth", "/"].includes(pathname)) {
          router.push("/auth")
        }
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [router, pathname, setUser, setLoading, setAuthenticated])

  const handleLogout = () => {
    logout()
    apiClient.clearTokens()
    router.push("/auth")
  }

  const isAuthPage = pathname?.startsWith("/auth")

  if (!mounted) return null
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user && !isAuthPage) return <div className="flex items-center justify-center h-screen">Redirecting...</div>

  if (isAuthPage) {
    return <>{children}</>
  }

  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  )

  return (
    <div className="flex h-screen bg-surface dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 transition-all duration-300 hidden md:flex flex-col`}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-xl font-jakarta font-bold text-primary">FlowDesk</h1>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
          {sidebarOpen ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-jakarta font-bold text-gray-900 dark:text-white">
            {visibleNavItems.find((item) => item.href === pathname)?.label || "FlowDesk"}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 md:hidden flex">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
