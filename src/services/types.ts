// API响应的基础接口
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// 分页数据结构
export interface PaginationInfo {
  total: number;
  page: number;
  page_size: number;
}

// 分页响应数据结构
export interface PaginationData<T> {
  items: T[];
  pagination: PaginationInfo;
}

// 管理员注册请求参数
export interface AdminRegisterRequest {
  email: string;
  password: string;
  register_code: string;
}

// 管理员登录请求参数
export interface AdminLoginRequest {
  email: string;
  password: string;
}

// 登录响应数据
export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    is_admin: boolean;
    created_at: string;
  };
}

// 创建用户请求参数
export interface CreateUserRequest {
  email: string;
  password: string;
}

// 知识库相关接口
export interface KnowledgeBase {
  id: number;
  name: string;
  description: string;
}

// 创建知识库请求参数
export interface CreateKnowledgeBaseRequest {
  name: string;
  description: string;
}

// 更新知识库请求参数
export interface UpdateKnowledgeBaseRequest {
  name: string;
  description: string;
}

// 文档相关接口
export interface Document {
  id: number;
  title: string;
  content: string;
}

// 创建文档请求参数
export interface CreateDocumentRequest {
  title: string;
  content: string;
}

// 获取文档列表的查询参数
export interface GetDocumentsQuery {
  knowledge_base_id: number;
  skip?: number;
  limit?: number;
}