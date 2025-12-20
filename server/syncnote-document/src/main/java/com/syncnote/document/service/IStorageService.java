package com.syncnote.document.service;

import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;

/**
 * 文件存储统一接口
 * 开发环境：minIO
 * 生产环境:阿里云OSS
 */
public interface IStorageService {

    /**
     * 上传文件到指定桶
     * @param file  待上传文件
     * @param bucketName 存储桶名称（ 若为空，使用默认桶）
     * @param objectName 对象名称（含路径）
     * @return objectName (文件在存储系统中唯一标识）
     */
    String uploadDocument(MultipartFile file, String bucketName,String objectName);

    /**
     * 上传文件到指定桶 (InputStream版本)
     * @param inputStream 文件流
     * @param size 文件大小
     * @param contentType 文件类型
     * @param bucketName 存储桶名称（ 若为空，使用默认桶）
     * @param objectName 对象名称（含路径）
     * @return objectName (文件在存储系统中唯一标识）
     */
    String uploadDocument(java.io.InputStream inputStream, long size, String contentType, String bucketName, String objectName);


    /**
     * 生成预签名下载 URL
     * @param bucketName 存储桶名称
     * @param objectName 对象名称（含路径）
     * @param duration 有效时间
     * @return 文件预签名URL
     */
    String getPresignedUrl(String bucketName, String objectName, Duration duration);

    /**
     * 删除存储系统中的文件
     * @param bucketName 存储桶名称（若为空，使用默认桶）
     * @param objectName 对象名称（含路径）
     * @throws RuntimeException 如果删除失败
     */
    void deleteDocument(String bucketName, String objectName);
}
