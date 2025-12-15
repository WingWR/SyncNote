package com.syncnote.document.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "storage.oss")
@Data
@Component
public class OssConfig {
    private String endpoint;
    private String accessKey;
    private String secretKey;
    private String bucket;
}
