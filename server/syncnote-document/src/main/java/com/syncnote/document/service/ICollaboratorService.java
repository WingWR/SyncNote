package com.syncnote.document.service;

import com.syncnote.document.dto.request.AddCollaboratorRequestDTO;
import com.syncnote.document.dto.request.UpdateCollaboratorPermissionRequestDTO;
import com.syncnote.document.dto.response.CollaboratorResponseDTO;

import java.util.List;

/**
 * 协作者服务
 * 提供文档协作者管理的相关功能
 */
public interface ICollaboratorService {
    /**
     * 获取文档协作者列表
     * @param documentId 文档ID
     * @param token 用户认证令牌
     * @return 协作者列表
     */
    List<CollaboratorResponseDTO> getCollaborators(Long documentId, String token);

    /**
     * 添加协作者
     * 只有文档拥有者或具有WRITE权限的协作者可以添加协作者
     * @param documentId 文档ID
     * @param request 添加协作者请求
     * @param token 用户认证令牌
     * @return 添加的协作者信息
     */
    CollaboratorResponseDTO addCollaborator(Long documentId, AddCollaboratorRequestDTO request, String token);

    /**
     * 移除协作者
     * 只有文档拥有者或具有WRITE权限的协作者可以移除协作者
     * @param documentId 文档ID
     * @param userId 要移除的用户ID
     * @param token 用户认证令牌
     */
    void removeCollaborator(Long documentId, Long userId, String token);

    /**
     * 加入共享文档
     * 用户通过文档ID直接加入到共享文档协作者列表，默认为READ权限
     * @param documentId 文档ID
     * @param token 用户认证令牌
     * @return 加入后的协作者信息
     */
    CollaboratorResponseDTO joinSharedDocument(Long documentId, String token);

    /**
     * 更新协作者权限
     * 只有文档拥有者或具有WRITE权限的协作者可以更新协作者权限
     * @param documentId 文档ID
     * @param userId 要更新权限的用户ID
     * @param request 更新权限请求
     * @param token 用户认证令牌
     * @return 更新后的协作者信息
     */
    CollaboratorResponseDTO updateCollaboratorPermission(Long documentId, Long userId, 
                                                         UpdateCollaboratorPermissionRequestDTO request, String token);
}
