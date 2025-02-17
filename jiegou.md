让我根据实际代码库重新整理功能和接口：

### 一、知识库管理页面

#### 1. 现有接口分析

1. 知识库基础操作：

```17:34:app/api/v1/admin/knowledge_base.py
@router.post("")
async def create_knowledge_base(
    kb: KnowledgeBaseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """创建新的知识库

    Args:
        kb (KnowledgeBaseCreate): 知识库创建模型，包含知识库的基本信息
        current_user: 当前登录用户
        db (AsyncSession): 数据库会话对象

    Returns:
        APIResponse: 包含创建成功的知识库信息的响应对象
    """
    kb_service = KnowledgeBaseService(db)
    result = await kb_service.create(kb, current_user.id)
```


创建知识库的接口。

2. 知识库查询：

```185:205:app/api/v1/admin/knowledge_base.py
@router.post("/{kb_id}/query")
async def query_knowledge_base(
    kb_id: int,
    query_request: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """查询知识库

    Args:
        kb_id (int): 知识库ID
        query_request (dict): 查询请求，包含查询文本和参数
        current_user: 当前登录用户
        db (AsyncSession): 数据库会话对象

    Returns:
        APIResponse: 包含查询结果的响应对象
    """
    kb_service = KnowledgeBaseService(db)
    result = await kb_service.query(kb_id, query_request, current_user.id)
    return APIResponse.success(data=result)
```


知识库查询接口。

3. 知识库权限管理：

```298:397:app/services/knowledge_base.py
    async def add_user(
        self,
        kb_id: int,
        permission_data: KnowledgeBasePermissionCreate,
        current_user_id: int
    ) -> None:
        """添加用户到知识库"""
        if not await self.check_permission(kb_id, current_user_id, PermissionType.ADMIN):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限执行此操作"
            )
            
        # 检查用户是否已有权限
        existing_permission = await self.get_user_permission(kb_id, permission_data.user_id)
        if existing_permission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户已经拥有此知识库的权限"
            )
            
        await self.db.execute(
            knowledge_base_users.insert().values(
                knowledge_base_id=kb_id,
                user_id=permission_data.user_id,
                permission=permission_data.permission
            )
        )
        await self.db.commit()

    async def update_user_permission(
        self,
        kb_id: int,
        user_id: int,
        permission_data: KnowledgeBasePermissionUpdate,
        current_user_id: int
    ) -> None:
        """更新用户的知识库权限"""
        if not await self.check_permission(kb_id, current_user_id, PermissionType.ADMIN):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限执行此操作"
            )
            
        # 不能修改所有者的权限
        kb = (await self.db.execute(
            select(KnowledgeBase).filter(KnowledgeBase.id == kb_id)
        )).scalar_one_or_none()
        
        if kb.owner_id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不能修改知识库所有者的权限"
            )
            
        await self.db.execute(
            knowledge_base_users.update()
            .where(
                and_(
                    knowledge_base_users.c.knowledge_base_id == kb_id,
                    knowledge_base_users.c.user_id == user_id
                )
            )
            .values(permission=permission_data.permission)
        )
        await self.db.commit()

    async def remove_user(
        self,
        kb_id: int,
        user_id: int,
        current_user_id: int
    ) -> None:
        """从知识库中移除用户"""
        if not await self.check_permission(kb_id, current_user_id, PermissionType.ADMIN):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有足够的权限执行此操作"
            )
            
        # 不能移除所有者
        kb = (await self.db.execute(
            select(KnowledgeBase).filter(KnowledgeBase.id == kb_id)
        )).scalar_one_or_none()
        
        if kb.owner_id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不能移除知识库所有者"
            )
            
        await self.db.execute(
            knowledge_base_users.delete().where(
                and_(
                    knowledge_base_users.c.knowledge_base_id == kb_id,
                    knowledge_base_users.c.user_id == user_id
                )
            )
        )
        await self.db.commit()
```


包含：
- 添加用户到知识库
- 更新用户权限
- 移除用户权限

4. 获取知识库列表：

```399:420:app/services/knowledge_base.py
    async def get_user_knowledge_bases(
        self,
        user_id: int
    ) -> List[KnowledgeBase]:
        """获取用户可访问的所有知识库"""
        user = (await self.db.execute(
            select(User).filter(User.id == user_id)
        )).scalar_one_or_none()
        
        # 管理员可以看到所有知识库
        if user.is_admin:
            return (await self.db.execute(select(KnowledgeBase))).scalars().all()
            
        # 普通用户只能看到自己有权限的知识库
        return (await self.db.execute(
            select(KnowledgeBase).join(
                knowledge_base_users,
                KnowledgeBase.id == knowledge_base_users.c.knowledge_base_id
            ).filter(
                knowledge_base_users.c.user_id == user_id
            )
        )).scalars().all()
```


获取用户可访问的知识库列表。

#### 2. 不同权限下的功能显示

基于 `PermissionType` 枚举：

```8:13:app/models/knowledge_base.py
class PermissionType(PyEnum):
    """权限类型"""
    OWNER = "owner"      # 所有者权限 完全控制权限
    ADMIN = "admin"      # 管理员权限 管理权限，可以管理其他用户的访问权限
    EDITOR = "editor"    # 编辑权限 编辑权限，可以添加/修改文档
    VIEWER = "viewer"    # 查看权限  查看权限，只能查看和使用
```


1. 系统管理员
```typescript
可见内容：所有知识库
可用接口：
- GET /knowledge-bases (获取所有知识库)
- POST /knowledge-bases (创建知识库)
- POST /{kb_id}/query (查询知识库)
```

2. 知识库OWNER/ADMIN
```typescript
可用接口：
- POST /{kb_id}/users (添加用户)
- PUT /{kb_id}/users/{user_id} (更新权限)
- DELETE /{kb_id}/users/{user_id} (移除用户)
- POST /{kb_id}/query (查询知识库)
```

3. 知识库EDITOR
```typescript
可用接口：
- PUT /knowledge-bases/{kb_id} (更新知识库)
- POST /{kb_id}/query (查询知识库)
```

4. 知识库VIEWER
```typescript
可用接口：
- GET /knowledge-bases/{kb_id} (获取知识库详情)
- POST /{kb_id}/query (查询知识库)
```

### 二、权限验证实现

1. 知识库权限验证：

```28:64:app/services/knowledge_base.py
    async def check_permission(
        self,
        kb_id: int,
        user_id: int,
        required_permission: PermissionType
    ) -> bool:
        """检查用户对知识库的权限"""
        # 管理员用户拥有所有权限
        user = (await self.db.execute(
            select(User).filter(User.id == user_id)
        )).scalar_one_or_none()
        
        if user and user.is_admin:
            return True
            
        # 查询用户权限
        permission = (await self.db.execute(
            select(knowledge_base_users).filter(
                and_(
                    knowledge_base_users.c.knowledge_base_id == kb_id,
                    knowledge_base_users.c.user_id == user_id
                )
            )
        )).first()
        
        if not permission:
            return False
            
        # 权限等级检查
        permission_levels = {
            PermissionType.VIEWER: 0,
            PermissionType.EDITOR: 1,
            PermissionType.ADMIN: 2,
            PermissionType.OWNER: 3
        }
        
        return permission_levels[permission.permission] >= permission_levels[required_permission]
```


2. 获取用户权限：

```66:81:app/services/knowledge_base.py
    async def get_user_permission(
        self,
        kb_id: int,
        user_id: int
    ) -> Optional[PermissionType]:
        """获取用户对知识库的权限级别"""
        permission = (await self.db.execute(
            select(knowledge_base_users).filter(
                and_(
                    knowledge_base_users.c.knowledge_base_id == kb_id,
                    knowledge_base_users.c.user_id == user_id
                )
            )
        )).first()
        
        return permission.permission if permission else None
```


### 三、前端实现建议

1. 知识库列表页面
```typescript
// 获取知识库列表
const getKnowledgeBases = async () => {
  const kb_service = new KnowledgeBaseService(db);
  const kbs = await kb_service.get_user_knowledge_bases(current_user.id);
  return kbs;
}

// 权限检查
const checkPermission = async (kb_id: number, required_permission: PermissionType) => {
  const kb_service = new KnowledgeBaseService(db);
  return await kb_service.check_permission(kb_id, current_user.id, required_permission);
}
```

2. 权限管理弹窗
```typescript
// 添加用户权限
const addUserPermission = async (kb_id: number, permission_data: KnowledgeBasePermissionCreate) => {
  const kb_service = new KnowledgeBaseService(db);
  await kb_service.add_user(kb_id, permission_data, current_user.id);
}

// 更新用户权限
const updateUserPermission = async (kb_id: number, user_id: number, permission_data: KnowledgeBasePermissionUpdate) => {
  const kb_service = new KnowledgeBaseService(db);
  await kb_service.update_user_permission(kb_id, user_id, permission_data, current_user.id);
}
```

注意：这次我只列出了代码库中实际存在的接口和功能。如果需要添加用户管理等其他功能，需要先实现相应的后端接口。

建议补充的接口：
1. 用户管理
- 获取用户列表
- 修改用户密码
- 更新用户信息

2. 知识库管理
- 批量导入/导出功能
- 知识库统计信息
- 操作日志记录

这些功能需要在后端实现相应的接口后才能在前端使用。
