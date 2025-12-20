package com.syncnote.document.service.impl;

import com.syncnote.document.service.IStorageService;
import com.syncnote.document.config.MinioConfig;
import io.minio.*;
import io.minio.http.Method;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.time.Duration;
@Service

public class MinIOStorageServiceImpl implements IStorageService {

    private final MinioClient minioClient;
    private final String defaultBucket;

    public MinIOStorageServiceImpl(MinioConfig minioConfig) {
        // 验证配置参数
        if (minioConfig.getEndpoint() == null || minioConfig.getEndpoint().isEmpty()) {
            throw new IllegalArgumentException("MinIO endpoint 配置不能为空，请检查 application-dev.yml 中的 storage.minio.endpoint 配置");
        }
        if (minioConfig.getAccessKey() == null || minioConfig.getAccessKey().isEmpty()) {
            throw new IllegalArgumentException("MinIO accessKey 配置不能为空，请检查 application-dev.yml 中的 storage.minio.accessKey 配置");
        }
        if (minioConfig.getSecretKey() == null || minioConfig.getSecretKey().isEmpty()) {
            throw new IllegalArgumentException("MinIO secretKey 配置不能为空，请检查 application-dev.yml 中的 storage.minio.secretKey 配置");
        }
        if (minioConfig.getBucket() == null || minioConfig.getBucket().isEmpty()) {
            throw new IllegalArgumentException("MinIO bucket 配置不能为空，请检查 application-dev.yml 中的 storage.minio.bucket 配置");
        }
        
        this.minioClient = MinioClient.builder()
                .endpoint(minioConfig.getEndpoint())
                .credentials(minioConfig.getAccessKey(), minioConfig.getSecretKey())
                .build();
        this.defaultBucket = minioConfig.getBucket();
    }

    @Override
    public String uploadDocument(MultipartFile file, String bucketName, String objectName) {
        try {
            String actualBucket = (bucketName != null && !bucketName.isEmpty()) ? bucketName : defaultBucket;

            // 确保存储桶存在
            if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(actualBucket).build())) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(actualBucket).build());
            }

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(actualBucket)
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return objectName;
        } catch (Exception e) {
            throw new RuntimeException("MinIO 文件上传失败", e);
        }
    }

    @Override
    public String uploadDocument(java.io.InputStream inputStream, long size, String contentType, String bucketName, String objectName) {
        try {
            String actualBucket = (bucketName != null && !bucketName.isEmpty()) ? bucketName : defaultBucket;

            // 确保存储桶存在
            if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(actualBucket).build())) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(actualBucket).build());
            }

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(actualBucket)
                            .object(objectName)
                            .stream(inputStream, size, -1)
                            .contentType(contentType)
                            .build()
            );

            return objectName;
        } catch (Exception e) {
            throw new RuntimeException("MinIO 文件上传失败", e);
        }
    }

    @Override
    public String getPresignedUrl(String bucketName, String objectName, Duration duration) {
        try {
            String actualBucket = (bucketName != null && !bucketName.isEmpty()) ? bucketName : defaultBucket;

            long expirySeconds = Math.min(duration.getSeconds(), 604800); // 限制最大 7 天

            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(actualBucket)
                            .object(objectName)
                            .expiry((int) expirySeconds)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("生成 MinIO 预签名 URL 失败", e);
        }
    }

    @Override
    public void deleteDocument(String bucketName, String objectName) {
        try {
            String actualBucket = (bucketName != null && !bucketName.isEmpty()) ? bucketName : defaultBucket;

            // 检查对象是否存在
            if (objectName == null || objectName.isEmpty()) {
                throw new IllegalArgumentException("对象名称不能为空");
            }

            // 删除对象
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(actualBucket)
                            .object(objectName)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("MinIO 文件删除失败: " + objectName, e);
        }
    }
}
