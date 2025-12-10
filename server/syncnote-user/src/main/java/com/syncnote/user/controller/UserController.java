package com.syncnote.user.controller;

import com.syncnote.user.dto.response.UpdateUserResponseDTO;
import com.syncnote.user.dto.response.UserResponseOfLoginInfo;
import com.syncnote.user.service.UserService;
import com.syncnote.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/me")
    public ApiResponse<UserResponseOfLoginInfo> getCurrentUser(@RequestHeader("Authorization") String authHeader){

        // 通过获得请求头，提取token
        String token = authHeader.replace("Bearer", "").trim();

        UserResponseOfLoginInfo userResponseOfLoginInfo = userService.getCurrentUser(token);
        return ApiResponse.succeed(userResponseOfLoginInfo, "获取用户成功");
    }

    @PutMapping("/me")
    public ApiResponse<UpdateUserResponseDTO> updateCurrentUser(@RequestHeader("Authorization") String authHeader,
                                                                @Valid @RequestBody UpdateUserResponseDTO dto) {
        // 通过获得请求头，提取token
        String token = authHeader.replace("Bearer", "").trim();

        userService.updateUserInfo(token, dto);
        return ApiResponse.succeed("更新用户信息成功");
    }
}
