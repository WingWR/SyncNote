-- 1. 用户表
CREATE TABLE IF NOT EXISTS `user` (
                                      `id` BIGINT NOT NULL COMMENT '主键ID(雪花算法)',
                                      `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像地址',
    `password_hash` VARCHAR(100) NOT NULL COMMENT '哈希加密密码',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 文档表
CREATE TABLE IF NOT EXISTS `document` (
                                          `id` BIGINT NOT NULL COMMENT '主键ID(雪花算法)',
                                          `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
    `file_path` VARCHAR(500) DEFAULT NULL COMMENT '存储路径(MinIO/OSS)',
    `file_type` VARCHAR(20) DEFAULT NULL COMMENT '文件类型(txt/md)',
    `file_size` BIGINT DEFAULT 0 COMMENT '单位:字节',
    `owner_id` BIGINT NOT NULL COMMENT '创建者ID',
    `status` VARCHAR(20) DEFAULT 'Active' COMMENT '状态(Active/Deleted/Archived)',
    `parent_id` BIGINT DEFAULT NULL COMMENT '父目录ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `created_by` BIGINT DEFAULT NULL COMMENT '创建者',
    `updated_by` BIGINT DEFAULT NULL COMMENT '更新者',
    PRIMARY KEY (`id`),
    KEY `idx_owner_id` (`owner_id`),
    KEY `idx_parent_id` (`parent_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 文档协作表
CREATE TABLE IF NOT EXISTS `document_collaborator` (
                                                       `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '自增ID',
                                                       `document_id` BIGINT NOT NULL COMMENT '文档ID',
                                                       `user_id` BIGINT NOT NULL COMMENT '用户ID',
                                                       `permission` VARCHAR(20) DEFAULT 'READ' COMMENT '权限(WRITE/READ)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_doc_user` (`document_id`, `user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;