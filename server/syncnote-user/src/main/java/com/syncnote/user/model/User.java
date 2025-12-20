package com.syncnote.user.model;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.Email;
import lombok.Data;

import java.time.Instant;

@Data
@TableName("user")
public class User {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String username;

    @Email
    private String email;

    private String avatar;

    @JsonIgnore
    private String passwordHash;

    @TableField(fill = FieldFill.INSERT)
    private Instant createdAt;
}
