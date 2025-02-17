import { Key, MoreHorizontal, Power, Shield, RefreshCw } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { User } from '@/services/types'
import { UpdatePasswordDialog } from './update-password-dialog'

interface UsersTableProps {
  users: User[]
  onUpdateStatus: (userId: number, is_active: boolean) => Promise<void>
  onUpdateAdmin: (userId: number, is_admin: boolean) => Promise<void>
  onResetKeys: (userId: number) => Promise<void>
}

export function UsersTable({
  users,
  onUpdateStatus,
  onUpdateAdmin,
  onResetKeys,
}: UsersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">ID</TableHead>
            <TableHead className="w-[180px]">邮箱</TableHead>
            <TableHead className="w-[100px]">角色</TableHead>
            <TableHead className="w-[100px]">状态</TableHead>
            <TableHead className="w-[200px]">
              <div className="flex items-center gap-2">
                SDK密钥
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => {/* 可以添加复制功能 */}}
                >
                  <Key className="h-3 w-3" />
                </Button>
              </div>
            </TableHead>
            <TableHead className="w-[200px]">
              <div className="flex items-center gap-2">
                密钥
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-transparent"
                  onClick={() => {/* 可以添加复制功能 */}}
                >
                  <Key className="h-3 w-3" />
                </Button>
              </div>
            </TableHead>
            <TableHead className="w-[160px]">创建时间</TableHead>
            <TableHead className="w-[100px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell className="truncate max-w-[180px]">
                <span className="truncate">{user.email}</span>
              </TableCell>
              <TableCell>
                <Badge variant={user.is_admin ? 'default' : 'secondary'}>
                  {user.is_admin ? '管理员' : '普通用户'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.is_active ? 'success' : 'destructive'}>
                  {user.is_active ? '已启用' : '已禁用'}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate max-w-[160px] cursor-help">
                          {user.sdk_key}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono">{user.sdk_key}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => navigator.clipboard.writeText(user.sdk_key)}
                  >
                    <Key className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate max-w-[160px] cursor-help">
                          {user.secret_key}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono">{user.secret_key}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => navigator.clipboard.writeText(user.secret_key)}
                  >
                    <Key className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleString('zh-CN')}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">打开菜单</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <UpdatePasswordDialog userId={user.id}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Key className="mr-2 h-4 w-4" />
                        修改密码
                      </DropdownMenuItem>
                    </UpdatePasswordDialog>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(user.id, !user.is_active)}
                    >
                      <Power className="mr-2 h-4 w-4" />
                      {user.is_active ? '禁用用户' : '启用用户'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateAdmin(user.id, !user.is_admin)}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      {user.is_admin ? '取消管理员' : '设为管理员'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onResetKeys(user.id)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      重置密钥对
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 