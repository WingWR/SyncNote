package com.syncnote.user.controller;

import com.syncnote.user.dto.request.LoginRequestDTO;
import com.syncnote.user.dto.response.LoginResponseDTO;
import com.syncnote.user.dto.request.RegisterRequestDTO;
import com.syncnote.user.model.User;
import com.syncnote.user.service.AuthService;
import com.syncnote.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ApiResponse<User> register(@Valid @RequestBody RegisterRequestDTO dto) {
        authService.register(dto);
        return ApiResponse.succeed("用户注册成功~");
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponseDTO> login(@RequestBody LoginRequestDTO dto) {
        LoginResponseDTO loginResponseDTO = authService.login(dto);
        return ApiResponse.succeed(loginResponseDTO, "用户登陆成功~");
    }
}
