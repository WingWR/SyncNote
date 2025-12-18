package com.syncnote.user.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserResponseOfLoginInfo {

    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    private String username;

    private String email;

    private String avatar;

    private LocalDateTime createdAt;
}
