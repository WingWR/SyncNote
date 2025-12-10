package com.syncnote.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserResponseOfLoginInfo {

    private Long id;

    private String username;

    private String email;

    private String avatar;

    private LocalDateTime createdAt;
}
