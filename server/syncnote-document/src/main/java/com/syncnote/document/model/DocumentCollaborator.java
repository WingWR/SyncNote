package com.syncnote.document.model;

import java.time.Instant;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Data;

@Data
@TableName("document_collaborator")
public class DocumentCollaborator {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long documentId;
    private Long userId;

    public enum Permission {
        OWNER,
        WRITE,
        READ;

        /**
         * 序列化枚举值为字符串（用于JSON序列化和DTO转换）
         * 这样Jackson会自动将枚举序列化为字符串值
         */
        @JsonValue
        public String toValue() {
            return this.name();
        }

        public boolean canRead() {
            return this == OWNER || this == WRITE || this == READ;
        }

        public boolean canWrite() {
            return this == OWNER || this == WRITE;
        }

        public boolean isOwner() {
            return this == OWNER;
        }
    }
    private Permission permission;

    @TableField(fill = FieldFill.INSERT)
    private Instant createdAt;
}
