import axios from 'axios';
import {
  AdminLoginRequest,
  AdminRegisterRequest,
  ApiResponse,
  CreateDocumentRequest,
  CreateKnowledgeBaseRequest,
  CreateUserRequest,
  Document,
  GetDocumentsQuery,
  KnowledgeBase,
  LoginResponse,
  UpdateKnowledgeBaseRequest,
} from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class AdminService {
  private static instance: AdminService;
  private baseUrl: string;
  private token: string = '';

  private constructor() {
    this.baseUrl = BASE_URL;
    
    // 添加响应拦截器
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // 清除token
          this.token = '';
          localStorage.removeItem('token');
          
          // 重定向到登录页面
          window.location.href = '/sign-in';
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // 管理员注册
  async register(data: AdminRegisterRequest): Promise<ApiResponse> {
    const response = await axios.post<ApiResponse>(
      `${this.baseUrl}/api/v1/admin/register`,
      data,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // 管理员登录
  async login(data: AdminLoginRequest): Promise<ApiResponse<LoginResponse>> {
    const formData = new URLSearchParams();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const response = await axios.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}/api/v1/admin/login`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  }

  // 创建普通用户
  async createUser(data: CreateUserRequest): Promise<ApiResponse> {
    const response = await axios.post<ApiResponse>(
      `${this.baseUrl}/api/v1/admin/users`,
      data,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // 创建知识库
  async createKnowledgeBase(
    data: CreateKnowledgeBaseRequest,
    userId: number
  ): Promise<ApiResponse<KnowledgeBase>> {
    const response = await axios.post<ApiResponse<KnowledgeBase>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases?user_id=${userId}`,
      data,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // 更新知识库
  async updateKnowledgeBase(
    id: number,
    data: UpdateKnowledgeBaseRequest
  ): Promise<ApiResponse<KnowledgeBase>> {
    const response = await axios.put<ApiResponse<KnowledgeBase>>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${id}`,
      data,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // 训练知识库
  async trainKnowledgeBase(id: number): Promise<ApiResponse> {
    const response = await axios.post<ApiResponse>(
      `${this.baseUrl}/api/v1/admin/knowledge-bases/${id}/train`,
      {},
      { headers: this.getHeaders() }
    );
    return response.data;
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
    );
    return response.data;
  }

  // 获取文档列表
  async getDocuments(query: GetDocumentsQuery): Promise<ApiResponse<Document[]>> {
    const { knowledge_base_id, skip = 0, limit = 10 } = query;
    const response = await axios.get<ApiResponse<Document[]>>(
      `${this.baseUrl}/api/v1/admin/documents?knowledge_base_id=${knowledge_base_id}&skip=${skip}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }
}

export const adminService = AdminService.getInstance();