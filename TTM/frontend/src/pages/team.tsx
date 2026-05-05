"use client"

import React, { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import { teamService, TeamMember } from "@/services/team"
import { Modal } from "@/components/Modal"
import { CardSkeleton } from "@/components/SkeletonLoader"
import { Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "@/stores/authStore"

export default function TeamPage() {
  const { user } = useAuthStore()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (user?.role !== "admin") return
    fetchTeam()
  }, [user])

  const fetchTeam = async () => {
    try {
      setLoading(true)
      const data = await teamService.getTeam()
      setMembers(data)
    } catch (error) {
      toast.error("Failed to fetch team")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRole = async (memberId: number, newRole: "admin" | "member") => {
    try {
      await teamService.updateUserRole(memberId, newRole)
      toast.success("Role updated!")
      fetchTeam()
    } catch (error) {
      toast.error("Failed to update role")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await teamService.deleteUser(userId)
      toast.success("User deleted!")
      fetchTeam()
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p className="text-error">Access Denied. Admin only.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-jakarta font-bold">Team Members</h1>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            Invite Member
          </button>
        </div>

        {/* Team Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-jakarta font-bold">Name</th>
                <th className="text-left px-4 py-3 font-jakarta font-bold">Email</th>
                <th className="text-left px-4 py-3 font-jakarta font-bold">Role</th>
                <th className="text-left px-4 py-3 font-jakarta font-bold">Tasks</th>
                <th className="text-left px-4 py-3 font-jakarta font-bold">Joined</th>
                <th className="text-left px-4 py-3 font-jakarta font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                    <td colSpan={6} className="px-4 py-3">
                      <CardSkeleton />
                    </td>
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No team members
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                          {member.name.charAt(0)}
                        </div>
                        {member.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {member.email}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.id, e.target.value as any)}
                        className="px-2 py-1 rounded text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">{member.task_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteUser(member.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Invite Team Member">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Feature coming soon! For now, users can register by visiting the login page.
          </p>
        </div>
      </Modal>
    </Layout>
  )
}
