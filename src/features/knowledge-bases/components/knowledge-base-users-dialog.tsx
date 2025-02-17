import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Trash } from 'lucide-react'
import { KnowledgeBaseDetail, PermissionType } from '@/services/types'

interface KnowledgeBaseUsersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  knowledgeBase: KnowledgeBaseDetail
  onAddUser: (email: string, permission: PermissionType) => Promise<void>
  onUpdatePermission: (userId: number, permission: PermissionType) => Promise<void>
  onRemoveUser: (userId: number) => Promise<void>
}

export function KnowledgeBaseUsersDialog({
  open,
  onOpenChange,
  knowledgeBase,
  onAddUser,
  onUpdatePermission,
  onRemoveUser,
}: KnowledgeBaseUsersDialogProps) {
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPermission, setNewUserPermission] = useState<PermissionType>(PermissionType.VIEWER)

  const handleAddUser = async () => {
    if (!newUserEmail) return
    await onAddUser(newUserEmail, newUserPermission)
    setNewUserEmail('')
    setNewUserPermission(PermissionType.VIEWER)
  }

  const getPermissionColor = (permission: PermissionType): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (permission) {
      case PermissionType.OWNER:
        return 'success'
      case PermissionType.ADMIN:
        return 'warning'
      case PermissionType.EDITOR:
        return 'default'
      case PermissionType.VIEWER:
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>管理知识库成员 - {knowledgeBase.name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-4 mb-4">
          <Input
            placeholder="用户邮箱"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
          />
          <Select
            value={newUserPermission}
            onValueChange={(value) => setNewUserPermission(value as PermissionType)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="选择权限" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PermissionType.ADMIN}>管理员</SelectItem>
              <SelectItem value={PermissionType.EDITOR}>编辑者</SelectItem>
              <SelectItem value={PermissionType.VIEWER}>查看者</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddUser}>添加成员</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>邮箱</TableHead>
              <TableHead>权限</TableHead>
              <TableHead>加入时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {knowledgeBase.users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.permission}
                    onValueChange={(value) =>
                      onUpdatePermission(user.user_id, value as PermissionType)
                    }
                    disabled={user.permission === PermissionType.OWNER}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPermissionColor(user.permission)}>
                            {user.permission === PermissionType.OWNER && '所有者'}
                            {user.permission === PermissionType.ADMIN && '管理员'}
                            {user.permission === PermissionType.EDITOR && '编辑者'}
                            {user.permission === PermissionType.VIEWER && '查看者'}
                          </Badge>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PermissionType.ADMIN}>管理员</SelectItem>
                      <SelectItem value={PermissionType.EDITOR}>编辑者</SelectItem>
                      <SelectItem value={PermissionType.VIEWER}>查看者</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  {user.permission !== PermissionType.OWNER && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveUser(user.user_id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
} 