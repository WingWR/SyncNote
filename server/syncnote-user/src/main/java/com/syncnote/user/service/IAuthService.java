package com.syncnote.user.service;

import com.syncnote.user.dto.request.LoginRequestDTO;
import com.syncnote.user.dto.response.LoginResponseDTO;
import com.syncnote.user.dto.request.RegisterRequestDTO;

public interface IAuthService {

    // 用户注册的逻辑
    void register(RegisterRequestDTO dto);

    // 用户登录的逻辑
    LoginResponseDTO login(LoginRequestDTO dto);

    // 用户退出登录
    void logout(String token);
}
