package com.syncnote.user.model;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.Email;
import lombok.Data;

import java.time.LocalDateTime;

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

    @JsonIgnore
    private String salt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
