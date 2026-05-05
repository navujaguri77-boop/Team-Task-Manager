"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import Layout from "@/components/Layout"

export default function IndexPage() {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    } else if (!isLoading && !user) {
      router.push("/auth")
    }
  }, [user, isLoading, router])

  return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-jakarta font-bold mb-4">FlowDesk</h1>
          <p className="text-gray-600 dark:text-gray-400">Team Task Manager</p>
        </div>
      </div>
    </Layout>
  )
}
