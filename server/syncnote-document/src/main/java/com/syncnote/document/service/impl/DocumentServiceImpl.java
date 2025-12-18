package com.syncnote.document.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.syncnote.document.dto.request.CreateDocumentRequestDTO;
import com.syncnote.document.dto.response.DocumentDetailDTO;
import com.syncnote.document.dto.response.DocumentDTO;
import com.syncnote.document.mapper.DocumentCollaboratorMapper;
import com.syncnote.document.mapper.DocumentMapper;
import com.syncnote.document.model.DocStatus;
import com.syncnote.document.model.Document;
import com.syncnote.document.model.DocumentCollaborator;
import com.syncnote.document.model.DocumentFileType;
import com.syncnote.document.config.StorageConfigProvider;
import com.syncnote.document.service.IDocumentService;
import com.syncnote.document.service.IStorageService;
import com.syncnote.util.context.CurrentUserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentServiceImpl implements IDocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentServiceImpl.class);

    @Autowired
    private DocumentMapper documentMapper;

    @Autowired
    private DocumentCollaboratorMapper documentCollaboratorMapper;
    
    @Autowired
    private IStorageService storageService;

    @Autowired
    private StorageConfigProvider storageConfigProvider;

    @Override
    public List<DocumentDTO> getDocumentList(String token) {
        // 从token中解析用户ID
        Long userId = CurrentUserContext.getUserId();

        if (userId == null) {
            throw new IllegalArgumentException("用户未登录或 token 无效");
        }

        // 查询协作表，同时获取文档ID和权限信息
        List<DocumentCollaborator> collaborators = documentCollaboratorMapper.selectList(
                new QueryWrapper<DocumentCollaborator>().eq("user_id", userId)
        );
        
        // 构建文档ID -> 权限的映射
        Map<Long, DocumentCollaborator.Permission> docPermissionMap = collaborators.stream()
                .collect(Collectors.toMap(
                        DocumentCollaborator::getDocumentId,
                        DocumentCollaborator::getPermission,
                        (existing, replacement) -> existing // 如果有重复的文档ID，保留第一个
                ));

        // 获取协作文档ID列表
        List<Long> collaboratorDocIds = collaborators.stream()
                .map(DocumentCollaborator::getDocumentId)
                .distinct()
                .collect(Collectors.toList());

        // 查询文档表：用户创建的文档 + 协作文档
        QueryWrapper<Document> queryWrapper = new QueryWrapper<>();
        queryWrapper.and(wrapper -> wrapper
                .eq("owner_id", userId)
                .or()
                .in(!collaboratorDocIds.isEmpty(), "id", collaboratorDocIds)
        ).ne("status", DocStatus.Deleted);

        List<Document> documents = documentMapper.selectList(queryWrapper);

        // 转换为DTO并设置权限
        return documents.stream().map(document -> {
            DocumentDTO dto = new DocumentDTO();
            BeanUtils.copyProperties(document, dto);
            dto.setIsDeleted(DocStatus.Deleted.equals(document.getStatus()));

            // 设置权限：如果是文档拥有者，权限为WRITE；否则从协作表中获取权限
            dto.setPermission(getPermissionString(document, userId, docPermissionMap));

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public DocumentDetailDTO getDocumentById(Long id, String token) {
        Long userId = CurrentUserContext.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("用户未登录");
        }

        // === 一次查询完成权限校验和文档获取 ===
        QueryWrapper<Document> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("id", id)
                .and(wrapper -> wrapper.eq("owner_id", userId)
                        .or()
                        .exists("SELECT 1 FROM document_collaborator dc WHERE dc.document_id = document.id AND dc.user_id = {0}", userId))
                .ne("status", DocStatus.Deleted);

        Document document = documentMapper.selectOne(queryWrapper);

        if (document == null) {
            throw new RuntimeException("文档不存在或无权限访问");
        }

        // 查询用户的权限信息
        DocumentCollaborator collaborator = documentCollaboratorMapper.selectOne(
                new QueryWrapper<DocumentCollaborator>()
                        .eq("document_id", document.getId())
                        .eq("user_id", userId)
        );

        // 转换 DTO
        DocumentDetailDTO dto = new DocumentDetailDTO();
        BeanUtils.copyProperties(document, dto);
        dto.setIsDeleted(DocStatus.Deleted.equals(document.getStatus()));

        // 设置权限：如果是文档拥有者，权限为WRITE；否则从协作表中获取权限
        if (document.getOwnerId().equals(userId)) {
            dto.setPermission(DocumentCollaborator.Permission.WRITE.toValue());
        } else if (collaborator != null) {
            dto.setPermission(collaborator.getPermission().toValue());
        } else {
            // 理论上不应该到这里，因为查询条件已经限制了权限
            dto.setPermission(DocumentCollaborator.Permission.READ.toValue());
        }

        // 从配置获取 bucket 名称
        String bucketName = storageConfigProvider.getBucketName();
        String presignedUrl = storageService.getPresignedUrl(bucketName, document.getFilePath(), Duration.ofHours(1));
        dto.setContentUrl(presignedUrl);

        return dto;
    }

    @Override
    public DocumentDTO createDocument(CreateDocumentRequestDTO dto, String token) {
        Long userId = CurrentUserContext.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("用户未登录或 token 无效");
        }

        // 创建文档对象
        Document document = new Document();
        document.setFileName(dto.getFileName());
        document.setFileType(dto.getFileType());
        document.setOwnerId(userId);
        document.setStatus(DocStatus.Active);
        document.setParentId(dto.getParentId());
        // filePath 和 fileSize 为空，因为是空白文档
        document.setFilePath(null);
        document.setFileSize(0L);

        // TODO: 如果提供了 templateId，从模板复制内容
        // if (dto.getTemplateId() != null) {
        //     // 从模板获取内容并设置到文档中
        // }

        // 插入文档记录
        documentMapper.insert(document);

        // 在协作表中为创建者添加WRITE权限
        DocumentCollaborator collaborator = new DocumentCollaborator();
        collaborator.setDocumentId(document.getId());
        collaborator.setUserId(userId);
        collaborator.setPermission(DocumentCollaborator.Permission.WRITE);
        documentCollaboratorMapper.insert(collaborator);

        // 转换为DTO
        DocumentDTO responseDTO = new DocumentDTO();
        BeanUtils.copyProperties(document, responseDTO);
        responseDTO.setIsDeleted(DocStatus.Deleted.equals(document.getStatus()));
        responseDTO.setPermission(DocumentCollaborator.Permission.WRITE.toValue());

        return responseDTO;
    }

    @Override
    public DocumentDTO uploadDocument(MultipartFile file, Long parentId, String token) {
        Long userId = CurrentUserContext.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("用户未登录或 token 无效");
        }

        // 验证文件
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("上传的文件不能为空");
        }

        // 验证文件类型
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("文件名不能为空");
        }

        // 从文件名提取文件类型
        String fileType = extractFileType(originalFilename);
        // 验证文件类型是否支持
        DocumentFileType.validate(fileType);

        // 生成文件路径（使用UUID避免文件名冲突）
        String filePath = generateFilePath(userId, originalFilename);

        // 上传文件到存储系统
        String bucketName = storageConfigProvider.getBucketName();
        String objectName = storageService.uploadDocument(file, bucketName, filePath);

        // 创建文档对象
        Document document = new Document();
        document.setFileName(originalFilename);
        document.setFileType(fileType);
        document.setFilePath(objectName); // StorageService返回的是objectName
        document.setFileSize(file.getSize());
        document.setOwnerId(userId);
        document.setStatus(DocStatus.Active);
        document.setParentId(parentId);

        // 插入文档记录
        documentMapper.insert(document);

        // 在协作表中为创建者添加WRITE权限
        DocumentCollaborator collaborator = new DocumentCollaborator();
        collaborator.setDocumentId(document.getId());
        collaborator.setUserId(userId);
        collaborator.setPermission(DocumentCollaborator.Permission.WRITE);
        documentCollaboratorMapper.insert(collaborator);

        // 转换为DTO
        DocumentDTO responseDTO = new DocumentDTO();
        BeanUtils.copyProperties(document, responseDTO);
        responseDTO.setIsDeleted(DocStatus.Deleted.equals(document.getStatus()));
        responseDTO.setPermission(DocumentCollaborator.Permission.WRITE.toValue());

        return responseDTO;
    }

    @Override
    public void deleteDocument(Long id, String token) {
        Long userId = CurrentUserContext.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("用户未登录或 token 无效");
        }

        // 查询文档，检查是否存在且用户是否为拥有者
        Document document = documentMapper.selectOne(
                new QueryWrapper<Document>()
                        .eq("id", id)
                        .eq("owner_id", userId)  // 只有拥有者才能删除
                        .ne("status", DocStatus.Deleted)  // 已删除的文档不能再删除
        );

        if (document == null) {
            throw new RuntimeException("文档不存在或无权限删除（只有文档拥有者可以删除文档）");
        }

        // 执行软删除：更新状态为Deleted
        document.setStatus(DocStatus.Deleted);
        documentMapper.updateById(document);
    }

    @Override
    public List<DocumentDTO> getTrashDocumentList(String token) {
        Long userId = CurrentUserContext.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("用户未登录或 token 无效");
        }

        // 查询用户拥有的已删除文档（回收站）
        QueryWrapper<Document> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("owner_id", userId)
                .eq("status", DocStatus.Deleted)
                .orderByDesc("updated_at"); // 按删除时间倒序排列

        List<Document> documents = documentMapper.selectList(queryWrapper);

        // 转换为DTO
        return documents.stream().map(document -> {
            DocumentDTO dto = new DocumentDTO();
            BeanUtils.copyProperties(document, dto);
            dto.setIsDeleted(true); // 回收站中的文档都是已删除状态
            dto.setPermission(DocumentCollaborator.Permission.WRITE.toValue()); // 拥有者始终有WRITE权限
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public void permanentlyDeleteDocument(Long id, String token) {
        Long userId = CurrentUserContext.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("用户未登录或 token 无效");
        }

        // 查询文档，检查是否存在且用户是否为拥有者，且状态为Deleted
        Document document = documentMapper.selectOne(
                new QueryWrapper<Document>()
                        .eq("id", id)
                        .eq("owner_id", userId)
                        .eq("status", DocStatus.Deleted)
        );

        if (document == null) {
            throw new RuntimeException("文档不存在或无权限永久删除（只有文档拥有者可以永久删除回收站中的文档）");
        }

        // 如果文档有文件路径，从存储系统中删除文件
        if (document.getFilePath() != null && !document.getFilePath().isEmpty()) {
            try {
                String bucketName = storageConfigProvider.getBucketName();
                storageService.deleteDocument(bucketName, document.getFilePath());
                logger.info("已从存储系统中删除文件: documentId={}, filePath={}", document.getId(), document.getFilePath());
            } catch (Exception e) {
                // 记录日志，但不阻止数据库删除（允许数据库删除继续执行）
                logger.error("删除存储系统中的文件失败: documentId={}, filePath={}, error={}", 
                        document.getId(), document.getFilePath(), e.getMessage(), e);
            }
        }

        // 删除协作关系
        documentCollaboratorMapper.delete(
                new QueryWrapper<DocumentCollaborator>()
                        .eq("document_id", id)
        );

        // 硬删除：从数据库中彻底删除文档记录
        documentMapper.deleteById(id);
    }

    /**
     * 获取权限字符串
     * 文档拥有者默认为WRITE权限，协作者从协作表中获取权限
     *
     * @param document 文档对象
     * @param userId 当前用户ID
     * @param docPermissionMap 文档ID到权限的映射
     * @return 权限字符串 ("WRITE" 或 "READ")
     */
    private String getPermissionString(Document document, Long userId, Map<Long, DocumentCollaborator.Permission> docPermissionMap) {
        // 如果是文档拥有者，权限为WRITE
        if (document.getOwnerId().equals(userId)) {
            return DocumentCollaborator.Permission.WRITE.toValue();
        }
        // 否则从协作表中获取权限，默认为READ
        DocumentCollaborator.Permission permission = docPermissionMap.get(document.getId());
        return permission != null ? permission.toValue() : DocumentCollaborator.Permission.READ.toValue();
    }

    /**
     * 从文件名提取文件类型
     *
     * @param filename 文件名
     * @return 文件类型（小写）
     */
    private String extractFileType(String filename) {
        if (filename == null || filename.isEmpty()) {
            return DocumentFileType.DEFAULT_TYPE;
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex + 1).toLowerCase();
        }
        return DocumentFileType.DEFAULT_TYPE;
    }

    /**
     * 生成文件存储路径
     * 格式: userId/yyyy-MM/dd/uuid-filename
     *
     * @param userId 用户ID
     * @param originalFilename 原始文件名
     * @return 文件路径
     */
    private String generateFilePath(Long userId, String originalFilename) {
        java.time.LocalDate now = java.time.LocalDate.now();
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String datePath = String.format("%d/%04d-%02d/%02d", userId, now.getYear(), now.getMonthValue(), now.getDayOfMonth());
        return String.format("%s/%s-%s", datePath, uuid, originalFilename);
    }
}