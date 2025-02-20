import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/admin'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { Document, DocumentType, CreateDocumentRequest, UpdateDocumentRequest } from '@/services/types'
import { DocumentEditDialog } from './document-edit-dialog'
import { DocumentPagination } from './document-pagination'

export function KnowledgeBaseDocumentsPage() {
  const { id } = useParams({ from: '/_authenticated/knowledge-bases/$id/documents/' })
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useState({
    title: '',
    doc_type: undefined as DocumentType | undefined,
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document>()

  // 获取知识库信息
  const { data: knowledgeBase } = useQuery({
    queryKey: ['knowledge-base', id],
    queryFn: () => adminService.getKnowledgeBase(Number(id)),
    enabled: !!id,
  })

  // 获取文档列表
  const { data: documentsData, refetch } = useQuery({
    queryKey: ['documents', id, searchParams, page, pageSize],
    queryFn: () =>
      adminService.getDocuments({
        knowledge_base_id: Number(id),
        skip: (page - 1) * pageSize,
        limit: pageSize,
        title: searchParams.title || undefined,
        doc_type: searchParams.doc_type,
      }),
    enabled: !!id,
  })

  const handleSearch = () => {
    setPage(1)
    refetch()
  }

  const handleReset = () => {
    setSearchParams({
      title: '',
      doc_type: undefined,
    })
    setPage(1)
    refetch()
  }

  const handleCreateOrUpdate = async (values: CreateDocumentRequest | UpdateDocumentRequest) => {
    try {
      if (selectedDocument) {
        await adminService.updateDocument(selectedDocument.id, values as UpdateDocumentRequest)
        toast({
          title: '更新文档成功',
        })
      } else {
        await adminService.createDocument(values as CreateDocumentRequest, Number(id))
        toast({
          title: '创建文档成功',
        })
      }
      setEditDialogOpen(false)
      refetch()
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: selectedDocument ? '更新文档失败' : '创建文档失败',
        description: '请稍后重试',
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedDocument) return
    try {
      await adminService.deleteDocument(selectedDocument.id)
      toast({
        title: '删除文档成功',
      })
      setDeleteDialogOpen(false)
      refetch()
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: '删除文档失败',
        description: '请稍后重试',
      })
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // 重置到第一页
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/knowledge-bases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {knowledgeBase?.data.name} - 文档管理
        </h1>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="搜索文档标题"
            value={searchParams.title}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </div>
        <Select
          value={searchParams.doc_type}
          onValueChange={(value) =>
            setSearchParams((prev) => ({
              ...prev,
              doc_type: value as DocumentType | undefined,
            }))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="文档类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部</SelectItem>
            <SelectItem value={DocumentType.TEXT}>文本</SelectItem>
            <SelectItem value={DocumentType.WEBPAGE}>网页</SelectItem>
            <SelectItem value={DocumentType.PDF}>PDF</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          搜索
        </Button>
        <Button variant="outline" onClick={handleReset}>
          重置
        </Button>
        <Button
          onClick={() => {
            setSelectedDocument(undefined)
            setEditDialogOpen(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          创建文档
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>标题</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>字数</TableHead>
            <TableHead>分块数</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!documentsData?.data.items.length ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-sm text-muted-foreground">
                  <p>暂无文档数据</p>
                  <p>点击右上角"创建文档"按钮开始创建</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            documentsData?.data.items.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.id}</TableCell>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{doc.doc_type}</TableCell>
                <TableCell>{doc.word_count}</TableCell>
                <TableCell>{doc.chunk_count}</TableCell>
                <TableCell>
                  {new Date(doc.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDocument(doc)
                      setEditDialogOpen(true)
                    }}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => {
                      setSelectedDocument(doc)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {documentsData?.data.pagination && documentsData.data.pagination.total > pageSize && (
        <DocumentPagination
          page={page}
          pageSize={pageSize}
          total={documentsData.data.pagination.total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <DocumentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        document={selectedDocument}
        onSubmit={handleCreateOrUpdate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除文档？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该文档，无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 