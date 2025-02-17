// API响应的基础接口
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// API错误响应的接口
export interface ApiErrorResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    error_type: string;
    path: string;
  };
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

// 用户基础信息
export interface User {
  id: number;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  sdk_key: string;
  secret_key: string;
  created_by_id: number;
  created_at: string;
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
  is_admin?: boolean;
  is_active?: boolean;
}

// 知识库相关接口
export interface KnowledgeBase {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

// 知识库权限类型
export enum PermissionType {
  OWNER = "owner",
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer"
}

// 知识库用户权限
export interface KnowledgeBaseUser {
  user_id: number;
  email: string;
  permission: PermissionType;
  created_at: string;
}

// 知识库详情
export interface KnowledgeBaseDetail extends KnowledgeBase {
  owner_email: string;
  users: KnowledgeBaseUser[];
}

// 知识库创建请求
export interface CreateKnowledgeBaseRequest {
  name: string;
  description?: string;
}

// 知识库更新请求
export interface UpdateKnowledgeBaseRequest {
  name?: string;
  description?: string;
}

// 知识库权限创建请求
export interface KnowledgeBasePermissionCreate {
  user_id: number;
  permission: PermissionType;
}

// 知识库权限更新请求
export interface KnowledgeBasePermissionUpdate {
  permission: PermissionType;
}

// 获取知识库列表的查询参数
export interface GetKnowledgeBasesQuery {
  page?: number;
  page_size?: number;
  name?: string;
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

// 用户列表分页响应
export interface GetUsersResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
}

// 修改密码请求参数
export interface UpdatePasswordRequest {
  old_password: string;
  new_password: string;
}

// 管理员修改用户密码请求参数
export interface AdminChangeUserPasswordRequest {
  new_password: string;
}

// 知识库查询请求
export interface KnowledgeBaseQueryRequest {
  query: string;
  [key: string]: unknown;
}

// 知识库查询响应
export interface KnowledgeBaseQueryResponse {
  answer: string;
  sources: string[];
  [key: string]: unknown;
}

// 知识库训练响应
export interface KnowledgeBaseTrainResponse {
  status: string;
  message: string;
}