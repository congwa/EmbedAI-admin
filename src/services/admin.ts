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
  KnowledgeBaseTrainResponse,
  KnowledgeBaseQueryRequest,
  KnowledgeBaseQueryResponse,
} from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// 添加全局响应拦截器
axios.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse
    if (!data.success) {
      // eslint-disable-next-line no-console
      console.log('API Error Response:', data)
     
      toast({
        title: '请求失败',
        description: data.message || '操作失败',
        variant: 'destructive',
      })
    }
    return response
  },
  (error) => {
    let errorResponse: ApiErrorResponse | undefined
  

    if (error.response) {
      errorResponse = error.response.data as ApiErrorResponse
      // eslint-disable-next-line no-console
      console.log('Error Response:', errorResponse)

      switch (error.response.status) {
        case 401:
          useAuthStore.getState().reset()
          if (!window.location.pathname.includes('/sign-in')) {
            window.location.href = '/sign-in'
          }
          toast({
            title: '',
            description: errorResponse?.message || '您的会话已过期，请重新登录',
            variant: 'destructive',
          })
          break
        case 403:
          useAuthStore.getState().reset()
          if (!window.location.pathname.includes('/sign-in')) {
            window.location.href = '/sign-in'
          }
          toast({
            title: '访问被拒绝',
            description: errorResponse?.message || '您没有权限访问此资源',
            variant: 'destructive',
          })
          break
        case 422:
        case 400:
          toast({
            title: '请求失败',
            description: errorResponse?.message || '数据验证错误',
            variant: 'destructive',
          })
          break
        case 500:
          toast({
            title: '服务器错误',
            description: errorResponse?.message || '服务器发生错误，请稍后重试',
            variant: 'destructive',
          })
          break
        default:
          toast({
            title: '操作失败',
            description: errorResponse?.message || '请求失败，请重试',
            variant: 'destructive',
          })
      }
    } else if (error.request) {
      toast({
        title: '网络错误',
        description: '无法连接到服务器，请检查网络连接',
        variant: 'destructive',
      })
    } else {
      toast({
        title: '请求错误',
        description: error.message,
        variant: 'destructive',
      })
    }
    return Promise.reject(error)
  }
)

class AdminService {
  private static instance: AdminService
  private baseUrl: string

  private constructor() {
    this.baseUrl = BASE_URL
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
    const response = await axios.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}/api/v1/admin/login`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  }

  // 创建普通用户
  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await axios.post<ApiResponse<User>>(
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
      `${this.baseUrl}/api/v1/admin/users`,
      {
        params: { page, page_size },
        headers: this.getHeaders(),
      }
    )
    return response.data
  }

  // 修改用户状态
  async updateUserStatus(userId: number, is_active: boolean): Promise<ApiResponse<User>> {
    const response = await axios.put<ApiResponse<User>>(
      `${this.baseUrl}/api/v1/admin/users/${userId}/status`,
      { is_active },
      { headers: this.getHeaders() }
    )
    return response.data
  }

  // 修改用户管理员权限
  async updateUserAdmin(userId: number, is_admin: boolean): Promise<ApiResponse<User>> {
    const response = await axios.put<ApiResponse<User>>(
      `${this.baseUrl}/api/v1/admin/users/${userId}/admin`,
      { is_admin },
      { headers: this.getHeaders() }
    )
    return response.data
  }

  // 重置用户密钥对
  async resetUserKeys(userId: number): Promise<ApiResponse<User>> {
    const response = await axios.post<ApiResponse<User>>(
      `${this.baseUrl}/api/v1/admin/users/${userId}/reset-keys`,
      {},
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
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${kb_id}/members`,
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
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${kb_id}/members/${user_id}`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async removeKnowledgeBaseUser(kb_id: number, user_id: number): Promise<ApiResponse<null>> {
    const response = await axios.delete<ApiResponse<null>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${kb_id}/members/${user_id}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async trainKnowledgeBase(id: number): Promise<ApiResponse<KnowledgeBaseTrainResponse>> {
    const response = await axios.post<ApiResponse<KnowledgeBaseTrainResponse>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${id}/train`,
      {},
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async queryKnowledgeBase(
    id: number,
    data: KnowledgeBaseQueryRequest
  ): Promise<ApiResponse<KnowledgeBaseQueryResponse>> {
    const response = await axios.post<ApiResponse<KnowledgeBaseQueryResponse>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${id}/query`,
      data,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getKnowledgeBase(id: number): Promise<ApiResponse<KnowledgeBaseDetail>> {
    const response = await axios.get<ApiResponse<KnowledgeBaseDetail>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${id}`,
      { headers: this.getHeaders() }
    )
    return response.data
  }

  async getMyKnowledgeBases(): Promise<ApiResponse<KnowledgeBaseDetail[]>> {
    const response = await axios.get<ApiResponse<KnowledgeBaseDetail[]>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/my`,
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
