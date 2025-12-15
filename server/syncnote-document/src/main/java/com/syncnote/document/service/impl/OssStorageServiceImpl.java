package com.syncnote.document.service.impl;

import com.aliyun.oss.OSSClientBuilder;
import com.syncnote.document.config.OssConfig;
import com.syncnote.document.service.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.aliyun.oss.OSS;

import java.io.InputStream;
import java.time.Duration;

@Service
@Profile("prod")
public class OssStorageServiceImpl implements StorageService {
    private static final Logger logger = LoggerFactory.getLogger(OssStorageServiceImpl.class);
    
    private final OSS ossClient;
    private final String defaultBucket;

    OssStorageServiceImpl(OssConfig ossConfig) {
        this.ossClient = new OSSClientBuilder()
                .build(
                        ossConfig.getEndpoint(),
                        ossConfig.getAccessKey(),
                        ossConfig.getSecretKey()
                );
        this.defaultBucket = ossConfig.getBucket();
    }


    @Override
    public String uploadDocument(MultipartFile file, String bucketName, String objectName) {
        try (InputStream inputStream = file.getInputStream()) {
            String actualBucket = (bucketName != null && !bucketName.isEmpty()) ? bucketName : defaultBucket;
            ossClient.putObject(actualBucket, objectName,inputStream,null);
            return objectName;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String getPresignedUrl(String bucketName, String objectName, Duration duration) {
        String actualBucket = (bucketName != null && !bucketName.isEmpty()) ? bucketName : defaultBucket;
        java.util.Date expiration = new java.util.Date(System.currentTimeMillis() + duration.toMillis());

        java.net.URL url = ossClient.generatePresignedUrl(actualBucket, objectName, expiration);
        return url.toString();
    }

    @Override
    public void deleteDocument(String bucketName, String objectName) {
        try {
            String actualBucket = (bucketName != null && !bucketName.isEmpty()) ? bucketName : defaultBucket;

            // 检查对象是否存在
            if (objectName == null || objectName.isEmpty()) {
                throw new IllegalArgumentException("对象名称不能为空");
            }

            // 检查对象是否存在（OSS会返回404如果不存在，但删除不存在的对象不会报错）
            if (!ossClient.doesObjectExist(actualBucket, objectName)) {
                // 对象不存在，记录日志但不抛出异常（幂等性）
                logger.warn("要删除的对象不存在，跳过删除: bucket={}, objectName={}", actualBucket, objectName);
                return;
            }

            // 删除对象
            ossClient.deleteObject(actualBucket, objectName);
        } catch (Exception e) {
            throw new RuntimeException("OSS 文件删除失败: " + objectName, e);
        }
    }
}
