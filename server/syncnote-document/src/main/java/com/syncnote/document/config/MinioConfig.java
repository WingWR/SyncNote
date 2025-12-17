package com.syncnote.document.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
@ConfigurationProperties(prefix = "storage.minio")
@Data
@Component
public class MinioConfig {
    @Value("${storage.minio.endpoint:http://localhost:9000}")
    private String endpoint; //端点URL地址

    @Value("${storage.minio.accessKey:minioadmin}")
    private String accessKey;//访问密钥，用户名

    @Value("${storage.minio.secretKey:minioadmin}")
    private String secretKey;//私有密钥，密码

    @Value("${storage.minio.bucket:syncnote-documents}")
    private String bucket;//bucket name

}