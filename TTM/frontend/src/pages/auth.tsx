"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { authService, apiClient } from "@/services/auth"
import { useAuthStore } from "@/stores/authStore"
import { Alert } from "@/components/Alert"

export default function AuthPage() {
  const router = useRouter()
  const { setUser, setAuthenticated } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "password" && !isLogin) {
      let strength = 0
      if (value.length >= 8) strength++
      if (/[A-Z]/.test(value)) strength++
      if (/[0-9]/.test(value)) strength++
      setPasswordStrength(strength)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      let authResponse

      if (isLogin) {
        authResponse = await authService.login(formData.email, formData.password)
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match")
        }
        authResponse = await authService.register(
          formData.name,
          formData.email,
          formData.password,
          formData.confirmPassword
        )
      }

      apiClient.setTokens(authResponse.access_token, authResponse.refresh_token)
      const user = await authService.getCurrentUser()
      setUser(user)
      setAuthenticated(true)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-jakarta font-bold text-primary mb-2">FlowDesk</h1>
          <p className="text-gray-600 dark:text-gray-400">Team Task Manager</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input"
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="input"
              placeholder="••••••••"
              required
            />
            {!isLogin && (
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded">
                <div
                  className={`h-full rounded transition-all ${
                    passwordStrength === 1
                      ? "w-1/3 bg-danger"
                      : passwordStrength === 2
                      ? "w-2/3 bg-warning"
                      : passwordStrength === 3
                      ? "w-full bg-success"
                      : "w-0"
                  }`}
                />
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input"
                placeholder="••••••••"
                required={!isLogin}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
