package com.syncnote.document.config;

import com.syncnote.util.context.CurrentUserContext;
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class MyMetaObjectHandler implements MetaObjectHandler {


    @Override
    public void insertFill(MetaObject metaObject) {
        // 填充时间
        strictInsertFill(metaObject, "createdAt", Instant::now, Instant.class);
        strictInsertFill(metaObject, "updatedAt", Instant::now, Instant.class);

        // 填充创建者用户ID（从 JWT 中获取）
        strictInsertFill(metaObject, "createdBy", this::getCurrentUserId, Long.class);

        // 填充更新者用户ID（从 JWT 中获取）
        strictUpdateFill(metaObject, "updatedBy", this::getCurrentUserId, Long.class);
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        strictUpdateFill(metaObject, "updatedAt", Instant::now, Instant.class);

        // 填充更新者用户ID（从 JWT 中获取）
        strictUpdateFill(metaObject, "updatedBy", this::getCurrentUserId, Long.class);
    }

    private Long getCurrentUserId() {
        try {
            return CurrentUserContext.getUserId();
        } catch (Exception e) {
            return null;
        }
    }

}
