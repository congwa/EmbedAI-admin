import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { KnowledgeBaseDetail } from '@/services/types'

const formSchema = z.object({
  name: z.string().min(1, '请输入知识库名称'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface KnowledgeBaseEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  knowledgeBase?: KnowledgeBaseDetail
  onSubmit: (values: FormValues) => Promise<void>
}

export function KnowledgeBaseEditDialog({
  open,
  onOpenChange,
  knowledgeBase,
  onSubmit,
}: KnowledgeBaseEditDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  useEffect(() => {
    if (knowledgeBase) {
      form.reset({
        name: knowledgeBase.name,
        description: knowledgeBase.description || '',
      })
    } else {
      form.reset({
        name: '',
        description: '',
      })
    }
  }, [knowledgeBase, form])

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {knowledgeBase ? '编辑知识库' : '创建知识库'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入知识库名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入知识库描述（选填）"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">
                {knowledgeBase ? '保存' : '创建'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 