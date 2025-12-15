package com.syncnote.document.model;

import java.time.Instant;
import java.time.LocalDateTime;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import lombok.Data;


@Data
@TableName("document")
public class Document {


    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String fileName;

    private String filePath;//开发：minIO 存储路径 生产：oss 存储路径

    private String fileType;

    private Long fileSize; // 单位：字节

    private Long ownerId;//创建者ID

    private DocStatus status;

    private Long parentId;//父目录ID

    @TableField(fill = FieldFill.INSERT)
    private Instant createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Instant updatedAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;

    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;




}
