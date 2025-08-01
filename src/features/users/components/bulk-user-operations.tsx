import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminService } from '@/services/admin'
import { User } from '@/services/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { progressNotificationManager } from '@/components/progress-notification'
import { notify } from '@/stores/notificationStore'
import {
  ChevronDown,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react'

interface BulkUserOperationsProps {
  users: User[]
  selectedUsers: number[]
  onSelectionChange: (selectedUsers: number[]) => void
  onOperationComplete: () => void
}

type BulkOperation = 
  | 'enable'
  | 'disable'
  | 'make_admin'
  | 'remove_admin'
  | 'reset_keys'
  | 'delete'

export function BulkUserOperations({
  users,
  selectedUsers,
  onSelectionChange,
  onOperationComplete,
}: BulkUserOperationsProps) {
  const { toast } = useToast()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingOperation, setPendingOperation] = useState<{
    type: BulkOperation
    title: string
    description: string
  } | null>(null)

  const selectedUserObjects = users.filter(user => selectedUsers.includes(user.id))
  const allSelected = users.length > 0 && selectedUsers.length === users.length
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length

  // 批量操作mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async ({ operation, userIds }: { operation: BulkOperation, userIds: number[] }) => {
      const operationNames = {
        enable: '启用',
        disable: '禁用',
        make_admin: '设为管理员',
        remove_admin: '取消管理员',
        reset_keys: '重置密钥',
        delete: '删除',
      }
      
      // 创建进度通知
      const progressId = progressNotificationManager.add({
        title: `批量${operationNames[operation]}用户`,
        description: `正在处理 ${userIds.length} 个用户...`,
        progress: 0,
        status: 'loading',
      })
      
      try {
        const promises = userIds.map(async (userId, index) => {
          let result
          switch (operation) {
            case 'enable':
              result = await adminService.updateUserStatus(userId, { is_active: true })
              break
            case 'disable':
              result = await adminService.updateUserStatus(userId, { is_active: false })
              break
            case 'make_admin':
              result = await adminService.updateUserAdmin(userId, { is_admin: true })
              break
            case 'remove_admin':
              result = await adminService.updateUserAdmin(userId, { is_admin: false })
              break
            case 'reset_keys':
              result = await adminService.resetUserKeys(userId)
              break
            case 'delete':
              result = await adminService.deleteUser(userId)
              break
            default:
              throw new Error(`Unknown operation: ${operation}`)
          }
          
          // 更新进度
          const progress = Math.round(((index + 1) / userIds.length) * 100)
          progressNotificationManager.update(progressId, {
            progress,
            description: `已处理 ${index + 1}/${userIds.length} 个用户`,
          })
          
          return result
        })
        
        const results = await Promise.all(promises)
        
        // 完成进度通知
        progressNotificationManager.complete(progressId, {
          title: '批量操作完成',
          description: `成功${operationNames[operation]} ${userIds.length} 个用户`,
        })
        
        return results
      } catch (error) {
        // 错误进度通知
        progressNotificationManager.error(progressId, {
          title: '批量操作失败',
          description: error instanceof Error ? error.message : '操作失败',
        })
        throw error
      }
    },
    onSuccess: (_, { operation, userIds }) => {
      const operationNames = {
        enable: '启用',
        disable: '禁用',
        make_admin: '设为管理员',
        remove_admin: '取消管理员',
        reset_keys: '重置密钥',
        delete: '删除',
      }
      
      // 添加成功通知到通知中心
      notify.success(
        '批量操作成功',
        `已成功${operationNames[operation]} ${userIds.length} 个用户`,
        {
          action: {
            label: '查看用户列表',
            onClick: () => {
              // 可以跳转到用户列表或刷新页面
              window.location.reload()
            },
          },
        }
      )
      
      onSelectionChange([])
      onOperationComplete()
      setShowConfirmDialog(false)
      setPendingOperation(null)
    },
    onError: (error) => {
      // 添加错误通知到通知中心
      notify.error(
        '批量操作失败',
        error instanceof Error ? error.message : '操作失败，请稍后重试',
        {
          persistent: true,
          action: {
            label: '重试',
            onClick: () => {
              if (pendingOperation) {
                bulkOperationMutation.mutate({
                  operation: pendingOperation.type,
                  userIds: selectedUsers,
                })
              }
            },
          },
        }
      )
      setShowConfirmDialog(false)
      setPendingOperation(null)
    },
  })

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(users.map(user => user.id))
    }
  }

  const handleBulkOperation = (operation: BulkOperation) => {
    if (selectedUsers.length === 0) {
      toast({
        variant: 'destructive',
        title: '请选择用户',
        description: '请先选择要操作的用户',
      })
      return
    }

    const operationConfigs = {
      enable: {
        title: '批量启用用户',
        description: `确定要启用选中的 ${selectedUsers.length} 个用户吗？`,
      },
      disable: {
        title: '批量禁用用户',
        description: `确定要禁用选中的 ${selectedUsers.length} 个用户吗？禁用后用户将无法登录。`,
      },
      make_admin: {
        title: '批量设为管理员',
        description: `确定要将选中的 ${selectedUsers.length} 个用户设为管理员吗？`,
      },
      remove_admin: {
        title: '批量取消管理员',
        description: `确定要取消选中的 ${selectedUsers.length} 个用户的管理员权限吗？`,
      },
      reset_keys: {
        title: '批量重置密钥',
        description: `确定要重置选中的 ${selectedUsers.length} 个用户的API密钥吗？旧密钥将失效。`,
      },
      delete: {
        title: '批量删除用户',
        description: `确定要删除选中的 ${selectedUsers.length} 个用户吗？此操作不可撤销！`,
      },
    }

    setPendingOperation({
      type: operation,
      ...operationConfigs[operation],
    })
    setShowConfirmDialog(true)
  }

  const confirmOperation = () => {
    if (pendingOperation) {
      bulkOperationMutation.mutate({
        operation: pendingOperation.type,
        userIds: selectedUsers,
      })
    }
  }

  const getOperationAvailability = (operation: BulkOperation) => {
    switch (operation) {
      case 'enable':
        return selectedUserObjects.some(user => !user.is_active)
      case 'disable':
        return selectedUserObjects.some(user => user.is_active)
      case 'make_admin':
        return selectedUserObjects.some(user => !user.is_admin)
      case 'remove_admin':
        return selectedUserObjects.some(user => user.is_admin)
      case 'reset_keys':
      case 'delete':
        return true
      default:
        return false
    }
  }

  return (
    <>
      <div className=\"flex items-center gap-4 p-4 bg-muted/50 rounded-lg\">
        <div className=\"flex items-center gap-2\">
          <Checkbox
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected
            }}
            onCheckedChange={handleSelectAll}
          />
          <span className=\"text-sm font-medium\">
            {selectedUsers.length > 0 ? (
              <>已选择 {selectedUsers.length} 个用户</>
            ) : (
              '全选'
            )}
          </span>
        </div>

        {selectedUsers.length > 0 && (
          <div className=\"flex items-center gap-2\">
            <Badge variant=\"secondary\" className=\"flex items-center gap-1\">
              <Users className=\"h-3 w-3\" />
              {selectedUsers.length}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant=\"outline\"
                  size=\"sm\"
                  disabled={bulkOperationMutation.isPending}
                >
                  批量操作
                  <ChevronDown className=\"ml-2 h-4 w-4\" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align=\"start\">
                <DropdownMenuItem
                  onClick={() => handleBulkOperation('enable')}
                  disabled={!getOperationAvailability('enable')}
                >
                  <UserCheck className=\"mr-2 h-4 w-4\" />
                  启用用户
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkOperation('disable')}
                  disabled={!getOperationAvailability('disable')}
                >
                  <UserX className=\"mr-2 h-4 w-4\" />
                  禁用用户
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkOperation('make_admin')}
                  disabled={!getOperationAvailability('make_admin')}
                >
                  <Shield className=\"mr-2 h-4 w-4\" />
                  设为管理员
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkOperation('remove_admin')}
                  disabled={!getOperationAvailability('remove_admin')}
                >
                  <ShieldOff className=\"mr-2 h-4 w-4\" />
                  取消管理员
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkOperation('reset_keys')}>
                  <RefreshCw className=\"mr-2 h-4 w-4\" />
                  重置密钥
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkOperation('delete')}
                  className=\"text-destructive focus:text-destructive\"
                >
                  <Trash2 className=\"mr-2 h-4 w-4\" />
                  删除用户
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant=\"ghost\"
              size=\"sm\"
              onClick={() => onSelectionChange([])}
            >
              取消选择
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingOperation?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingOperation?.description}
              
              {selectedUserObjects.length > 0 && (
                <div className=\"mt-4 p-3 bg-muted rounded-lg\">
                  <div className=\"text-sm font-medium mb-2\">选中的用户：</div>
                  <div className=\"space-y-1 max-h-32 overflow-y-auto\">
                    {selectedUserObjects.map(user => (
                      <div key={user.id} className=\"text-xs flex items-center gap-2\">
                        <span className=\"font-mono\">{user.id}</span>
                        <span>{user.email}</span>
                        <Badge variant={user.is_admin ? 'default' : 'secondary'} className=\"text-xs\">
                          {user.is_admin ? '管理员' : '普通用户'}
                        </Badge>
                        <Badge variant={user.is_active ? 'success' : 'destructive'} className=\"text-xs\">
                          {user.is_active ? '已启用' : '已禁用'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkOperationMutation.isPending}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmOperation}
              disabled={bulkOperationMutation.isPending}
              className={pendingOperation?.type === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {bulkOperationMutation.isPending ? '处理中...' : '确认'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}