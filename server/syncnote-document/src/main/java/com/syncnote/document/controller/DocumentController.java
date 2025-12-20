package com.syncnote.document.controller;

import com.syncnote.document.dto.request.CreateDocumentRequestDTO;
import com.syncnote.document.dto.response.DocumentDetailDTO;
import com.syncnote.document.dto.response.DocumentDTO;
import com.syncnote.util.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.syncnote.document.service.IDocumentService;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    @Autowired
    private IDocumentService documentService;

    /**
     * 3.1 获取文档列表
     */
    @GetMapping
    public ApiResponse<List<DocumentDTO>> getDocumentList(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        List<DocumentDTO> documents = documentService.getDocumentList(token);
        return ApiResponse.succeed(documents, "获取文档列表成功");
    }

    /**
     * 3.2 获取单个文档
     */
    @GetMapping("/{id}")
    public ApiResponse<DocumentDetailDTO> getDocumentById(@PathVariable("id") Long id,
                                                       @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        DocumentDetailDTO document = documentService.getDocumentById(id, token);
        return ApiResponse.succeed(document, "获取文档成功");
    }

    /**
     * 3.3 创建文档（空白文档）
     * 创建空白文档记录，不包含实际文件内容
     * 可通过 templateId 从模板创建文档
     */
    @PostMapping
    public ApiResponse<DocumentDTO> createDocument(@Valid @RequestBody CreateDocumentRequestDTO dto,
                                                           @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        DocumentDTO document = documentService.createDocument(dto, token);
        return ApiResponse.succeed(document, "创建文档成功");
    }

    // TODO: 3.4 更新文档 - 待实现
    // @PutMapping("/{id}")
    // public ApiResponse<DocumentDTO> updateDocument(...)
    // 获取 Yjs 二进制状态
    @GetMapping("/{id}/state")
    public ApiResponse<String> getDocumentState(@PathVariable Long id) {
        // 返回 Base64 编码的二进制数据
        return ApiResponse.succeed(documentService.getDocumentBinaryState(id), "获取Y.js的二进制状态成功");
    }

    // 保存 Yjs 二进制状态
    @PostMapping("/{id}/state")
    public ApiResponse<Void> saveDocumentState(@PathVariable Long id, @RequestBody Map<String, String> body) {
        // 接收 Base64 字符串
        documentService.saveDocumentBinaryState(id, body.get("state"));
        return ApiResponse.succeed("保存Y.js的二进制状态成功");
    }

    /**
     * 3.5 删除文档（软删除）
     * 只有文档拥有者才能删除文档，删除后文档状态变为Deleted（放入回收站）
     * 
     * @param id 文档ID
     * @param authHeader 认证令牌
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteDocument(@PathVariable("id") Long id,
                                            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        documentService.deleteDocument(id, token);
        return ApiResponse.succeed("删除文档成功");
    }

    /**
     * 3.6 上传文档
     * 上传文件并创建文档记录
     * 文件会自动上传到存储系统，并创建对应的文档记录
     * 
     * @param file 上传的文件
     * @param parentId 父目录ID（可选）
     * @param base64State Y.js的Base64状态
     * @param authHeader 认证令牌
     */
    @PostMapping("/upload")
    public ApiResponse<DocumentDTO> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "parentId", required = false) Long parentId,
            @RequestParam("base64State") String base64State,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        DocumentDTO document = documentService.uploadDocument(file, parentId, base64State, token);
        return ApiResponse.succeed(document, "上传文档成功");
    }

    /**
     * 3.7 获取回收站文档列表
     * 获取当前用户已删除（软删除）的文档列表
     * 
     * @param authHeader 认证令牌
     */
    @GetMapping("/trash")
    public ApiResponse<List<DocumentDTO>> getTrashDocumentList(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        List<DocumentDTO> documents = documentService.getTrashDocumentList(token);
        return ApiResponse.succeed(documents, "获取回收站文档列表成功");
    }

    /**
     * 3.8 永久删除文档（硬删除）
     * 从回收站中永久删除文档，会从数据库和存储系统中彻底删除
     * 只有文档拥有者才能永久删除
     * 
     * @param id 文档ID
     * @param authHeader 认证令牌
     */
    @DeleteMapping("/trash/{id}")
    public ApiResponse<Void> permanentlyDeleteDocument(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "").trim();
        documentService.permanentlyDeleteDocument(id, token);
        return ApiResponse.succeed("永久删除文档成功");
    }
}
