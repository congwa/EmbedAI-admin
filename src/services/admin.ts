import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/hooks/use-toast'
import {
  AdminLoginRequest,
  AdminRegisterRequest,
  ApiResponse,
  ApiErrorResponse,
  CreateDocumentRequest,
  CreateKnowledgeBaseRequest,
  CreateUserRequest,
  Document,
  GetDocumentsQuery,
  KnowledgeBase,
  LoginResponse,
  UpdateKnowledgeBaseRequest,
  PaginationData,
  User,
  UpdatePasswordRequest,
  AdminChangeUserPasswordRequest,
  GetKnowledgeBasesQuery,
  KnowledgeBaseDetail,
  KnowledgeBasePermissionCreate,
  KnowledgeBasePermissionUpdate,
} from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class AdminService {
  private static instance: AdminService
  private baseUrl: string

  private constructor() {
    this.baseUrl = BASE_URL

    // 添加响应拦截器
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        let errorResponse: ApiErrorResponse | undefined

        if (error.response) {
          errorResponse = error.response.data as ApiErrorResponse

          // 处理 HTTP 错误状态
          switch (error.response.status) {
            case 401:
              // 未认证，清除 store 中的 token
              useAuthStore.getState().reset()
              // 重定向到登录页面
              window.location.href = '/sign-in'
              break
            case 403:
              // 无权限访问
              useAuthStore.getState().reset()
              window.location.href = '/sign-in'
              break
            case 422:
              // 数据验证错误，显示具体的错误信息
              toast({
                title: '操作失败',
                description: errorResponse.message,
                variant: 'destructive',
              })
              break
            case 500:
              // 服务器错误
              toast({
                title: '服务器错误',
                description: '服务器发生错误，请稍后重试',
                variant: 'destructive',
              })
              break
            default:
              // 其他错误
              toast({
                title: '操作失败',
                description: errorResponse?.message || '请求失败，请重试',
                variant: 'destructive',
              })
          }
        } else if (error.request) {
          // 请求发出但没有收到响应
          toast({
            title: '网络错误',
            description: '无法连接到服务器，请检查网络连接',
            variant: 'destructive',
          })
        } else {
          // 请求配置出错
          toast({
            title: '请求错误',
            description: error.message,
            variant: 'destructive',
          })
        }
        return Promise.reject(error)
      }
    )
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService()
    }
    return AdminService.instance
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    const token = useAuthStore.getState().accessToken
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  // 管理员注册
  async register(data: AdminRegisterRequest): Promise<ApiResponse> {
    const response = await axios.post<ApiResponse>(
      `${this.baseUrl}/api/v1/admin/register`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  // 管理员登录
  async login(data: AdminLoginRequest): Promise<ApiResponse<LoginResponse>> {
    const formData = new URLSearchParams()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const response = await axios.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}/api/v1/admin/login`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    return response.data
  }

  // 创建普通用户
  async createUser(data: CreateUserRequest): Promise<ApiResponse> {
    const response = await axios.post<ApiResponse>(
      `${this.baseUrl}/api/v1/admin/users`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  // 获取普通用户列表
  async getUsers(
    page: number = 1,
    page_size: number = 10
  ): Promise<ApiResponse<PaginationData<User>>> {
    const response = await axios.get<ApiResponse<PaginationData<User>>>(
      `${this.baseUrl}/api/v1/admin/users?page=${page}&page_size=${page_size}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  // 知识库管理相关接口
  async getKnowledgeBases(params: GetKnowledgeBasesQuery): Promise<ApiResponse<PaginationData<KnowledgeBaseDetail>>> {
    const response = await axios.get<ApiResponse<PaginationData<KnowledgeBaseDetail>>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases`,
      {
        params,
        headers: this.getHeaders(),
      }
    )
    return response.data
  }

  async createKnowledgeBase(data: CreateKnowledgeBaseRequest): Promise<ApiResponse<KnowledgeBaseDetail>> {
    const response = await axios.post<ApiResponse<KnowledgeBaseDetail>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async updateKnowledgeBase(
    id: number,
    data: UpdateKnowledgeBaseRequest
  ): Promise<ApiResponse<KnowledgeBaseDetail>> {
    const response = await axios.put<ApiResponse<KnowledgeBaseDetail>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${id}`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async deleteKnowledgeBase(id: number): Promise<ApiResponse<null>> {
    const response = await axios.delete<ApiResponse<null>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${id}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async addKnowledgeBaseUser(
    kb_id: number,
    data: KnowledgeBasePermissionCreate
  ): Promise<ApiResponse<null>> {
    const response = await axios.post<ApiResponse<null>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${kb_id}/users`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async updateKnowledgeBaseUserPermission(
    kb_id: number,
    user_id: number,
    data: KnowledgeBasePermissionUpdate
  ): Promise<ApiResponse<null>> {
    const response = await axios.put<ApiResponse<null>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${kb_id}/users/${user_id}`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async removeKnowledgeBaseUser(kb_id: number, user_id: number): Promise<ApiResponse<null>> {
    const response = await axios.delete<ApiResponse<null>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${kb_id}/users/${user_id}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  // 训练知识库
  async trainKnowledgeBase(id: number): Promise<ApiResponse> {
    const response = await axios.post<ApiResponse>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${id}/train`,
      {},
      { headers: this.getHeaders() }
    )
    return response.data
  }

  // 创建文档
  async createDocument(
    data: CreateDocumentRequest,
    knowledgeBaseId: number
  ): Promise<ApiResponse<Document>> {
    const response = await axios.post<ApiResponse<Document>>(
      `${this.baseUrl}/api/v1/admin/documents?knowledge_base_id=${knowledgeBaseId}`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  // 获取文档列表
  async getDocuments(
    query: GetDocumentsQuery
  ): Promise<ApiResponse<Document[]>> {
    const { knowledge_base_id, skip = 0, limit = 10 } = query
    const response = await axios.get<ApiResponse<Document[]>>(
      `${this.baseUrl}/api/v1/admin/documents?knowledge_base_id=${knowledge_base_id}&skip=${skip}&limit=${limit}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  // 修改密码
  async updatePassword(data: UpdatePasswordRequest): Promise<ApiResponse> {
    const response = await axios.put<ApiResponse>(
      `${this.baseUrl}/api/v1/admin/password`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  // 管理员修改用户密码
  async adminChangeUserPassword(
    userId: number,
    data: AdminChangeUserPasswordRequest
  ): Promise<ApiResponse> {
    const response = await axios.put<ApiResponse>(
      `${this.baseUrl}/api/v1/admin/users/${userId}/password`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }
}

export const adminService = AdminService.getInstance()
