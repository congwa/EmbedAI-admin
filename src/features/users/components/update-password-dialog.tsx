import { useState } from 'react'
import { Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { adminService } from '@/services/admin'

interface UpdatePasswordDialogProps {
  userId: number
}

export function UpdatePasswordDialog({ userId }: UpdatePasswordDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({
    new_password: '',
  })

  const handleSubmit = async () => {
    try {
      await adminService.adminChangeUserPassword(userId, form)
      toast({
        title: '修改成功',
        description: '密码修改成功',
      })
      setIsOpen(false)
      // 重置表单
      setForm({
        new_password: '',
      })
    } catch {
      // 错误已经在拦截器中处理
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="mr-2 h-4 w-4" />
          修改密码
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>修改用户密码</DialogTitle>
          <DialogDescription>
            请输入新密码，密码长度至少6个字符。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new_password" className="text-right">
              新密码
            </Label>
            <Input
              id="new_password"
              type="password"
              className="col-span-3"
              value={form.new_password}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  new_password: e.target.value,
                }))
              }
              placeholder="请输入至少6个字符的密码"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>确认修改</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 