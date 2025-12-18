package com.syncnote.document.controller;


import com.syncnote.document.dto.request.AddCollaboratorRequestDTO;
import com.syncnote.document.dto.request.UpdateCollaboratorPermissionRequestDTO;
import com.syncnote.document.dto.response.CollaboratorResponseDTO;
import com.syncnote.util.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.syncnote.document.service.ICollaboratorService;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 文档协作者控制器
 * 提供文档协作者管理相关的API接口
 * 使用 /api/documents 路径（复数形式），符合前端API定义
 */
@RestController
@RequestMapping("/api/documents")
public class DocumentCollaboratorController {

    @Autowired
    private ICollaboratorService collaboratorService;

    /**
     * 4.1 获取文档协作者列表
     * 获取指定文档的所有协作者信息
     * 文档拥有者或协作者可以查看协作者列表
     * 
     * @param documentId 文档ID
     * @param authHeader 认证令牌
     * @return 协作者列表
     */
    @GetMapping("/{documentId}/collaborators")
    public ApiResponse<List<CollaboratorResponseDTO>> getCollaborators(
            @PathVariable("documentId") Long documentId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        List<CollaboratorResponseDTO> collaborators = collaboratorService.getCollaborators(documentId, token);
        return ApiResponse.succeed(collaborators, "获取协作者列表成功");
    }

    /**
     * 4.2 添加协作者
     * 为文档添加新的协作者
     * 只有文档拥有者或具有写权限的协作者可以添加协作者
     * 
     * @param documentId 文档ID
     * @param request 添加协作者请求（包含userId和permission）
     * @param authHeader 认证令牌
     * @return 添加的协作者信息
     */
    @PostMapping("/{documentId}/collaborators")
    public ApiResponse<CollaboratorResponseDTO> addCollaborator(
            @PathVariable("documentId") Long documentId,
            @Valid @RequestBody AddCollaboratorRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        CollaboratorResponseDTO collaborator = collaboratorService.addCollaborator(documentId, request, token);
        return ApiResponse.succeed(collaborator, "添加协作者成功");
    }

    /**
     * 4.3 移除协作者
     * 从文档中移除指定的协作者
     * 只有文档拥有者或具有写权限的协作者可以移除协作者
     * 
     * @param documentId 文档ID
     * @param userId 要移除的用户ID
     * @param authHeader 认证令牌
     * @return 操作结果
     */
    @DeleteMapping("/{documentId}/collaborators/{userId}")
    public ApiResponse<Void> removeCollaborator(
            @PathVariable Long documentId,
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        collaboratorService.removeCollaborator(documentId, userId, token);
        return ApiResponse.succeed("移除协作者成功");
    }

    /**
     * 4.4 加入共享文档
     * 用户通过文档ID直接加入到共享文档协作者列表，默认为READ权限
     * 适用于通过分享链接加入文档的场景
     * 
     * @param documentId 文档ID
     * @param authHeader 认证令牌
     * @return 加入后的协作者信息
     */
    @PostMapping("/{documentId}/join")
    public ApiResponse<CollaboratorResponseDTO> joinSharedDocument(
            @PathVariable("documentId") Long documentId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        CollaboratorResponseDTO collaborator = collaboratorService.joinSharedDocument(documentId, token);
        return ApiResponse.succeed(collaborator, "加入共享文档成功");
    }

    /**
     * 4.5 更新协作者权限
     * 更新指定协作者的权限（READ或WRITE）
     * 只有文档拥有者或具有写权限的协作者可以更新协作者权限
     * 
     * @param documentId 文档ID
     * @param userId 要更新权限的用户ID
     * @param request 更新权限请求（包含新的permission）
     * @param authHeader 认证令牌
     * @return 更新后的协作者信息
     */
    @PutMapping("/{documentId}/collaborators/{userId}/permission")
    public ApiResponse<CollaboratorResponseDTO> updateCollaboratorPermission(
            @PathVariable Long documentId,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateCollaboratorPermissionRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        CollaboratorResponseDTO collaborator = collaboratorService.updateCollaboratorPermission(documentId, userId, request, token);
        return ApiResponse.succeed(collaborator, "更新协作者权限成功");
    }
}
