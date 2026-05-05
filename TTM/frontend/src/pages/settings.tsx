"use client"

import React, { useState } from "react"
import Layout from "@/components/Layout"
import { useAuthStore } from "@/stores/authStore"
import { authService, apiClient } from "@/services/auth"
import toast from "react-hot-toast"

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const [formData, setFormData] = useState({
    name: user?.name || "",
    avatar_url: user?.avatar_url || "",
  })
  const [loading, setLoading] = useState(false)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updated = await authService.updateProfile(formData)
      setUser(updated)
      toast.success("Profile updated!")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    apiClient.clearTokens()
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setUser(null)
    window.location.href = "/auth"
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-jakarta font-bold mb-6">Settings</h1>

        {/* Profile Settings */}
        <div className="card mb-6">
          <h2 className="text-lg font-jakarta font-bold mb-4">Profile Settings</h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Avatar URL</label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                className="input"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="card mb-6">
          <h2 className="text-lg font-jakarta font-bold mb-4">Account Information</h2>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Joined</p>
              <p className="font-medium">
                {user?.created_at && new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-danger/30">
          <h2 className="text-lg font-jakarta font-bold mb-4 text-danger">Danger Zone</h2>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Logging out will clear your session and you'll need to sign in again.
            </p>
            <button onClick={handleLogout} className="px-4 py-2 bg-danger/10 text-danger rounded hover:bg-danger/20 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
