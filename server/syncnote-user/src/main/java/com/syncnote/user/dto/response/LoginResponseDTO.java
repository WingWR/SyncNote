package com.syncnote.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {

    private UserResponseOfLoginInfo userResponseOfLoginInfo;

    private String token;
}
