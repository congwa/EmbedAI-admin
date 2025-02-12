'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { adminService } from '@/services/admin'
import { useAuth } from '@/stores/authStore'
import { CreateUserDialog } from './components/create-user-dialog'
import { UsersTable } from './components/users-table'
import { Pagination } from './components/pagination'

export default function UsersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const pageSize = 10

  // 检查是否是管理员
  useEffect(() => {
    if (!user?.is_admin) {
      navigate({ to: '/' })
    }
  }, [user, navigate])

  // 获取用户列表
  const { data: usersData, refetch } = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => adminService.getUsers(page, pageSize),
    enabled: !!user?.is_admin, // 只有管理员才能获取数据
  })

  if (!user?.is_admin) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">用户管理</h2>
        <CreateUserDialog onSuccess={refetch} />
      </div>

      {usersData?.data.items && <UsersTable users={usersData.data.items} />}

      {usersData?.data.pagination && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={usersData.data.pagination.total}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
