package com.syncnote.document.task;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.syncnote.document.config.StorageConfigProvider;
import com.syncnote.document.mapper.DocumentCollaboratorMapper;
import com.syncnote.document.mapper.DocumentMapper;
import com.syncnote.document.model.DocStatus;
import com.syncnote.document.model.Document;
import com.syncnote.document.model.DocumentCollaborator;
import com.syncnote.document.service.IStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/**
 * 文档清理定时任务
 * 定期清理回收站中超过指定天数的文档（硬删除）
 */
@Component
public class DocumentCleanupTask {

    private static final Logger logger = LoggerFactory.getLogger(DocumentCleanupTask.class);

    /**
     * 回收站文档保留天数（默认7天）
     * 可以通过配置文件进行配置
     */
    private static final int TRASH_RETENTION_DAYS = 7;

    @Autowired
    private DocumentMapper documentMapper;

    @Autowired
    private DocumentCollaboratorMapper documentCollaboratorMapper;

    @Autowired
    private StorageConfigProvider storageConfigProvider;

    @Autowired
    private IStorageService storageService;

    /**
     * 定时清理回收站中超过保留期的文档
     * 每天凌晨2点执行一次
     * cron表达式: 秒 分 时 日 月 周
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredTrashDocuments() {
        logger.info("开始执行回收站文档清理任务...");

        try {
            // 计算过期时间点（7天前）
            Instant expiredTime = Instant.now().minusSeconds(TRASH_RETENTION_DAYS * 24 * 60 * 60L);

            // 查询所有已删除且删除时间超过7天的文档
            QueryWrapper<Document> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("status", DocStatus.Deleted)
                    .lt("updated_at", expiredTime); // updated_at 是软删除时更新的时间

            List<Document> expiredDocuments = documentMapper.selectList(queryWrapper);

            if (expiredDocuments.isEmpty()) {
                logger.info("没有需要清理的过期文档");
                return;
            }

            logger.info("发现 {} 个过期文档需要清理", expiredDocuments.size());

            int deletedCount = 0;
            int errorCount = 0;

            for (Document document : expiredDocuments) {
                try {
                    // 删除协作关系
                    documentCollaboratorMapper.delete(
                            new QueryWrapper<DocumentCollaborator>()
                                    .eq("document_id", document.getId())
                    );

                    // 如果文档有文件路径，从存储系统中删除文件
                    if (document.getFilePath() != null && !document.getFilePath().isEmpty()) {
                        try {
                            String bucketName = storageConfigProvider.getBucketName();
                            storageService.deleteDocument(bucketName, document.getFilePath());
                            logger.debug("已从存储系统中删除文件: documentId={}, filePath={}", 
                                    document.getId(), document.getFilePath());
                        } catch (Exception e) {
                            // 记录日志，但不阻止数据库删除（允许继续执行）
                            logger.warn("删除存储系统中的文件失败: documentId={}, filePath={}, error={}", 
                                    document.getId(), document.getFilePath(), e.getMessage());
                        }
                    }

                    // 硬删除：从数据库中彻底删除文档记录
                    documentMapper.deleteById(document.getId());
                    deletedCount++;

                    logger.debug("已永久删除文档: ID={}, fileName={}", document.getId(), document.getFileName());
                } catch (Exception e) {
                    errorCount++;
                    logger.error("删除文档失败: ID={}, fileName={}, error={}", 
                            document.getId(), document.getFileName(), e.getMessage(), e);
                }
            }

            logger.info("回收站文档清理任务完成: 成功删除 {} 个文档, 失败 {} 个文档", deletedCount, errorCount);
        } catch (Exception e) {
            logger.error("执行回收站文档清理任务时发生错误", e);
        }
    }
}

