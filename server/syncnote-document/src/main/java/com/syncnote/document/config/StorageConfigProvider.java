package com.syncnote.document.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * 统一存储配置提供者
 * 根据当前环境（dev/prod）获取对应的 bucket 配置
 */
@Component
public class StorageConfigProvider {

    private final MinioConfig minioConfig;
    private final OssConfig ossConfig;
    private final Environment environment;

    public StorageConfigProvider(MinioConfig minioConfig, OssConfig ossConfig, Environment environment) {
        this.minioConfig = minioConfig;
        this.ossConfig = ossConfig;
        this.environment = environment;
    }

    /**
     * 获取当前环境下的 bucket 名称
     * 开发环境使用 MinIO 配置，生产环境使用 OSS 配置
     *
     * @return bucket 名称
     * @throws IllegalStateException 如果 bucket 配置为空
     */
    public String getBucketName() {
        // 检查是否为生产环境
        String[] activeProfiles = environment.getActiveProfiles();
        boolean isProd = java.util.Arrays.asList(activeProfiles).contains("prod");

        if (isProd) {
            String bucket = ossConfig.getBucket();
            if (bucket == null || bucket.isEmpty()) {
                throw new IllegalStateException("生产环境 OSS bucket 配置不能为空，请检查 application-prod.yml 中的 storage.oss.bucket 配置");
            }
            return bucket;
        } else {
            // 开发环境使用 MinIO
            String bucket = minioConfig.getBucket();
            if (bucket == null || bucket.isEmpty()) {
                throw new IllegalStateException("开发环境 MinIO bucket 配置不能为空，请检查 application-dev.yml 中的 storage.minio.bucket 配置");
            }
            return bucket;
        }
    }
}

