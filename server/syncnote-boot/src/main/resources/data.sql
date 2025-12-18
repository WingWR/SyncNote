-- 初始化一个测试管理员账号 (注意: 这里的 password_hash 仅为示例，实际应存储加密后的)
INSERT IGNORE INTO `user` (`id`, `username`, `email`, `password_hash`)
VALUES (1, 'admin', 'admin@syncnote.com', '$2a$10$FRYnZhMjmZjMl/jsC62bGebS5owixsMjM7g4bX7Ee7YXYcsSMGA/S');

-- 初始化一个测试文档 (关联到 admin)
INSERT IGNORE INTO `document` (`id`, `file_name`, `file_type`, `owner_id`, `status`)
VALUES (1001, '欢迎使用SyncNote.md', 'md', 1, 'Active');

-- 初始化协作关系 (admin 拥有自己文档的写权限)
INSERT IGNORE INTO `document_collaborator` (`document_id`, `user_id`, `permission`)
VALUES (1001, 1, 'WRITE');