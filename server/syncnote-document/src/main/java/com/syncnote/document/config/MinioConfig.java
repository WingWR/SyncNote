package com.syncnote.document.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "storage.minio")
@Data
@Component
public class MinioConfig {
    private String endpoint; //端点URL地址
    private String accessKey;//访问密钥，用户名
    private String secretKey;//私有密钥，密码
    private String bucket;//bucket name

}
