package com.syncnote.user.dto;

import com.syncnote.user.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private User user;
    private String token;
}
