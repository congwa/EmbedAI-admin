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
  domain: string;
  status: KnowledgeBaseStatus;
  example_queries: string[];
  entity_types: string[];
  owner_id: number;
  created_at: string;
  updated_at: string;
  llm_config?: KnowledgeBaseLLMConfig;
}

// 知识库状态枚举
export enum KnowledgeBaseStatus {
  INIT = "init",
  TRAINING = "training",
  READY = "ready",
  ERROR = "error"
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

// LLM配置接口
export interface LLMConfig {
  model: string;                 // LLM模型名称
  base_url: string;             // API基础URL
  api_key: string;              // API密钥
}

// Embeddings配置接口
export interface EmbeddingsConfig {
  model: string;                 // Embedding模型名称
  base_url: string;             // API基础URL
  api_key: string;              // API密钥
  embedding_dim: number;         // Embedding维度
}

// 完整的LLM配置接口
export interface KnowledgeBaseLLMConfig {
  llm: LLMConfig;               // LLM配置
  embeddings: EmbeddingsConfig; // Embeddings配置
}

// 知识库创建请求
export interface CreateKnowledgeBaseRequest {
  name: string;                           // 必填：知识库名称
  domain: string;                        // 可选：知识库领域，默认为"通用知识领域"
  example_queries?: string[];             // 可选：示例查询列表
  entity_types?: string[];               // 可选：实体类型列表
  llm_config?: KnowledgeBaseLLMConfig;   // 可选：LLM配置
}

// 知识库更新请求
export interface UpdateKnowledgeBaseRequest {
  name: string;                          // 必填：知识库名称
  domain: string;                        // 必填：知识库名称
  example_queries?: string[];             // 可选：示例查询列表
  entity_types?: string[];               // 可选：实体类型列表
  llm_config?: KnowledgeBaseLLMConfig;   // 可选：LLM配置
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

// 知识库成员信息
export interface KnowledgeBaseMember {
  id: number;
  email: string;
  permission: PermissionType;
  is_owner: boolean;
  is_admin: boolean;
  created_at: string;
}

// 知识库成员列表响应
export interface KnowledgeBaseMemberList {
  members: KnowledgeBaseMember[];
  total: number;
}

// 获取知识库列表的查询参数
export interface GetKnowledgeBasesQuery {
  page?: number;
  page_size?: number;
  name?: string;
}

// 文档类型枚举
export enum DocumentType {
  TEXT = 'text',
  WEBPAGE = 'webpage',
  PDF = 'pdf',
}

// 文档基础信息
export interface Document {
  id: number;
  title: string;
  content: string;
  doc_type: DocumentType;
  knowledge_base_id: number;
  created_at: string;
  updated_at: string;
  created_by_id: number;
  is_deleted: boolean;
  word_count: number;
  chunk_count: number;
  metadata?: Record<string, unknown>;
  source_url?: string;
}

// 创建文档请求参数
export interface CreateDocumentRequest {
  title: string;
  content: string;
  doc_type: DocumentType;
  metadata?: Record<string, unknown>;
}

// 更新文档请求参数
export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  doc_type?: DocumentType;
  metadata?: Record<string, unknown>;
}

// 获取文档列表的查询参数
export interface GetDocumentsQuery {
  knowledge_base_id: number;
  skip?: number;
  limit?: number;
  title?: string;
  doc_type?: DocumentType;
  start_time?: string;
  end_time?: string;
}

// 文档分页响应
export interface DocumentPagination {
  total: number;
  page: number;
  page_size: number;
  items: Document[];
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
  query: string;                          // 必填：查询文本
  stream?: boolean;                       // 可选：是否使用流式响应
  temperature?: number;                   // 可选：温度参数，控制响应的随机性
  top_k?: number;                        // 可选：返回的相关文档数量
  similarity_threshold?: number;          // 可选：相似度阈值
}

// 知识库查询响应
export interface KnowledgeBaseQueryResponse {
  answer: string;                         // 回答内容
  sources: Array<{                        // 引用来源
    document_id: number;                  // 文档ID
    document_name: string;                // 文档名称
    content: string;                      // 相关内容片段
    similarity: number;                   // 相似度分数
  }>;
  tokens_used?: {                         // 可选：token使用统计
    prompt_tokens: number;                // 提示词token数
    completion_tokens: number;            // 完成词token数
    total_tokens: number;                 // 总token数
  };
  metadata?: Record<string, unknown>;     // 可选：其他元数据
}

// 知识库训练响应
export interface KnowledgeBaseTrainResponse {
  status: KnowledgeBaseStatus;            // 知识库状态
  message: string;                        // 状态描述信息
  total_documents?: number;               // 可选：总文档数
  processed_documents?: number;           // 可选：已处理文档数
  error_documents?: number;               // 可选：处理失败文档数
  estimated_time_remaining?: number;      // 可选：预估剩余时间（秒）
}