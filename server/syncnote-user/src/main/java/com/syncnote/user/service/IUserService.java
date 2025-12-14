package com.syncnote.user.service;

import com.syncnote.user.dto.response.UpdateUserResponseDTO;
import com.syncnote.user.dto.response.UserResponseOfLoginInfo;
import com.syncnote.user.model.User;

public interface IUserService {

    // 获得当前用户登录信息
    UserResponseOfLoginInfo getCurrentUser(String token);

    // 更新用户信息
    void updateUserInfo(String token, UpdateUserResponseDTO dto);

    // 从Token解析信息
    User getUserInfoFromToken(String token);
}
