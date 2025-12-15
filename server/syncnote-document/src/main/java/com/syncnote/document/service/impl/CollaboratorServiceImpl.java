package com.syncnote.document.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.syncnote.document.dto.request.AddCollaboratorRequestDTO;
import com.syncnote.document.dto.response.CollaboratorResponseDTO;
import com.syncnote.document.mapper.DocumentCollaboratorMapper;
import com.syncnote.document.mapper.DocumentMapper;
import com.syncnote.document.model.DocStatus;
import com.syncnote.document.model.Document;
import com.syncnote.document.model.DocumentCollaborator;
import com.syncnote.util.context.CurrentUserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.syncnote.document.service.ICollaboratorService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 协作者服务实现类
 */
@Service
public class CollaboratorServiceImpl implements ICollaboratorService {

    @Autowired
    private DocumentCollaboratorMapper documentCollaboratorMapper;

    @Autowired
    private DocumentMapper documentMapper;

    @Override
    public List<CollaboratorResponseDTO> getCollaborators(Long documentId, String token) {
        Long userId = CurrentUserContext.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("用户未登录或 token 无效");
        }

        // 验证文档是否存在且用户有权限查看（拥有者或协作者）
        Document document = documentMapper.selectById(documentId);
        if (document == null || DocStatus.Deleted.equals(document.getStatus())) {
            throw new RuntimeException("文档不存在");
        }

        // 检查用户是否有权限查看协作者列表（拥有者或协作者都可以查看）
        boolean hasPermission;
        if (document.getOwnerId().equals(userId)) {
            hasPermission = true;
        } else {
            DocumentCollaborator collaborator = documentCollaboratorMapper.selectOne(
                    new QueryWrapper<DocumentCollaborator>()
                            .eq("document_id", documentId)
                            .eq("user_id", userId)
            );
            hasPermission = collaborator != null;
        }

        if (!hasPermission) {
            throw new RuntimeException("无权查看该文档的协作者列表");
        }

        // 查询所有协作者
        List<DocumentCollaborator> collaborators = documentCollaboratorMapper.selectList(
                new QueryWrapper<DocumentCollaborator>()
                        .eq("document_id", documentId)
        );

        // 转换为DTO
        return collaborators.stream().map(collaborator -> {
            CollaboratorResponseDTO dto = new CollaboratorResponseDTO();
            dto.setId(collaborator.getId());
            dto.setDocumentId(collaborator.getDocumentId());
            dto.setUserId(collaborator.getUserId());
            dto.setPermission(collaborator.getPermission().toValue());
            dto.setJoinedAt(collaborator.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public CollaboratorResponseDTO addCollaborator(Long documentId, AddCollaboratorRequestDTO request, String token) {
        Long userId = CurrentUserContext.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("用户未登录或 token 无效");
        }

        // 验证文档是否存在
        Document document = documentMapper.selectById(documentId);
        if (document == null || DocStatus.Deleted.equals(document.getStatus())) {
            throw new RuntimeException("文档不存在");
        }

        // 验证当前用户是否有权限添加协作者（只有文档拥有者或具有WRITE权限的协作者可以添加）
        boolean canAdd;
        if (document.getOwnerId().equals(userId)) {
            canAdd = true;
        } else {
            DocumentCollaborator currentUserCollaborator = documentCollaboratorMapper.selectOne(
                    new QueryWrapper<DocumentCollaborator>()
                            .eq("document_id", documentId)
                            .eq("user_id", userId)
            );
            canAdd = currentUserCollaborator != null 
                    && DocumentCollaborator.Permission.WRITE.equals(currentUserCollaborator.getPermission());
        }

        if (!canAdd) {
            throw new RuntimeException("无权添加协作者（只有文档拥有者或具有写权限的协作者可以添加）");
        }

        // 验证要添加的用户是否已经是协作者
        DocumentCollaborator existingCollaborator = documentCollaboratorMapper.selectOne(
                new QueryWrapper<DocumentCollaborator>()
                        .eq("document_id", documentId)
                        .eq("user_id", request.getUserId())
        );

        if (existingCollaborator != null) {
            throw new RuntimeException("该用户已经是协作者");
        }

        // 不能将自己添加为协作者（如果已经是拥有者）
        if (document.getOwnerId().equals(request.getUserId())) {
            throw new RuntimeException("文档拥有者不能添加为自己为协作者");
        }

        // 验证权限值
        DocumentCollaborator.Permission permission = convertStringToPermission(request.getPermission());
        if (permission == null) {
            throw new IllegalArgumentException("权限值无效，只能是 'read' 或 'write'");
        }

        // 创建协作者记录
        DocumentCollaborator collaborator = new DocumentCollaborator();
        collaborator.setDocumentId(documentId);
        collaborator.setUserId(request.getUserId());
        collaborator.setPermission(permission);
        documentCollaboratorMapper.insert(collaborator);

        // 转换为DTO
        CollaboratorResponseDTO dto = new CollaboratorResponseDTO();
        dto.setId(collaborator.getId());
        dto.setDocumentId(collaborator.getDocumentId());
        dto.setUserId(collaborator.getUserId());
        dto.setPermission(collaborator.getPermission().toValue());
        dto.setJoinedAt(collaborator.getCreatedAt());

        return dto;
    }

    @Override
    public void removeCollaborator(Long documentId, Long userIdToRemove, String token) {
        Long userId = CurrentUserContext.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("用户未登录或 token 无效");
        }

        // 验证文档是否存在
        Document document = documentMapper.selectById(documentId);
        if (document == null || DocStatus.Deleted.equals(document.getStatus())) {
            throw new RuntimeException("文档不存在");
        }

        // 验证当前用户是否有权限移除协作者（只有文档拥有者或具有WRITE权限的协作者可以移除）
        boolean canRemove;
        if (document.getOwnerId().equals(userId)) {
            canRemove = true;
        } else {
            DocumentCollaborator currentUserCollaborator = documentCollaboratorMapper.selectOne(
                    new QueryWrapper<DocumentCollaborator>()
                            .eq("document_id", documentId)
                            .eq("user_id", userId)
            );
            canRemove = currentUserCollaborator != null 
                    && DocumentCollaborator.Permission.WRITE.equals(currentUserCollaborator.getPermission());
        }

        if (!canRemove) {
            throw new RuntimeException("无权移除协作者（只有文档拥有者或具有写权限的协作者可以移除）");
        }

        // 验证要移除的用户是否是协作者
        DocumentCollaborator collaboratorToRemove = documentCollaboratorMapper.selectOne(
                new QueryWrapper<DocumentCollaborator>()
                        .eq("document_id", documentId)
                        .eq("user_id", userIdToRemove)
        );

        if (collaboratorToRemove == null) {
            throw new RuntimeException("该用户不是协作者");
        }

        // 删除协作者记录
        documentCollaboratorMapper.deleteById(collaboratorToRemove.getId());
    }

    /**
     * 将字符串转换为权限枚举
     * "write" -> WRITE, "read" -> READ
     * 小写转大写防止前端返回小写，但统一大写
     */
    private DocumentCollaborator.Permission convertStringToPermission(String permissionStr) {
        if (permissionStr == null) {
            return null;
        }
        try {
            return DocumentCollaborator.Permission.valueOf(permissionStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
