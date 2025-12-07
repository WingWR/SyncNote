package com.syncnote.user.controller;

import com.syncnote.user.dto.LoginDTO;
import com.syncnote.user.dto.LoginResponseDTO;
import com.syncnote.user.dto.RegisterDTO;
import com.syncnote.user.model.User;
import com.syncnote.user.service.AuthService;
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
    public User register(@Valid @RequestBody RegisterDTO dto) throws Exception {
        return authService.register(dto);
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginDTO dto) throws Exception {
        return authService.login(dto);
    }
}
