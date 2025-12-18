package com.syncnote.document.service;

import com.syncnote.document.dto.request.CreateDocumentRequestDTO;
import com.syncnote.document.dto.response.DocumentDetailDTO;
import com.syncnote.document.dto.response.DocumentDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 文档服务
 * 提供CRUD服务
 */
public interface IDocumentService {
    /**
     * 获取文档列表
     * @param token 用户认证令牌
     * @return 文档列表
     */
    List<DocumentDTO> getDocumentList(String token);

    /**
     * 根据ID获取文档详情
     * @param id 文档ID
     * @param token 用户认证令牌
     * @return 文档详情
     */
    DocumentDetailDTO getDocumentById(Long id, String token);

    /**
     * 创建空白文档
     * 创建文档记录，并在协作表中为创建者添加WRITE权限
     * 
     * @param dto 创建文档请求DTO
     * @param token 用户认证令牌
     * @return 创建的文档信息
     */
    DocumentDTO createDocument(CreateDocumentRequestDTO dto, String token);

    /**
     * 上传文档并创建记录
     * 上传文件到存储系统，创建文档记录，并在协作表中为创建者添加WRITE权限
     * 
     * @param file 上传的文件
     * @param parentId 父目录ID（可选）
     * @param token 用户认证令牌
     * @return 创建的文档信息
     */
    DocumentDTO uploadDocument(MultipartFile file, Long parentId, String token);

    /**
     * 删除文档（软删除）
     * 只有文档拥有者才能删除文档，删除后文档状态变为Deleted（放入回收站）
     * 
     * @param id 文档ID
     * @param token 用户认证令牌
     */
    void deleteDocument(Long id, String token);

    /**
     * 获取回收站文档列表
     * 获取当前用户已删除（软删除）的文档列表
     * 
     * @param token 用户认证令牌
     * @return 回收站文档列表
     */
    List<DocumentDTO> getTrashDocumentList(String token);

    /**
     * 永久删除回收站中的文档（硬删除）
     * 只有文档拥有者才能永久删除，会从数据库和存储系统中彻底删除
     * 
     * @param id 文档ID
     * @param token 用户认证令牌
     */
    void permanentlyDeleteDocument(Long id, String token);
}