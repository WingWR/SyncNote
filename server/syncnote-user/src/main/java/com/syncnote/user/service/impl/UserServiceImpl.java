package com.syncnote.user.service.impl;

import com.syncnote.user.dto.response.UpdateUserResponseDTO;
import com.syncnote.user.dto.response.UserResponseOfLoginInfo;
import com.syncnote.user.mapper.UserMapper;
import com.syncnote.user.model.User;
import com.syncnote.user.service.IUserService;
import com.syncnote.util.JWT.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements IUserService {

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private UserMapper userMapper;

    @Override
    public UserResponseOfLoginInfo getCurrentUser(String token){
        User user = getUserInfoFromToken(token);

        return new UserResponseOfLoginInfo(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getAvatar(),
                user.getCreatedAt()
        );
    }

    @Override
    public void updateUserInfo(String token, UpdateUserResponseDTO dto){
        getUserInfoFromToken(token);
        User user = getUserInfoFromToken(token);

        if(dto.getUsername() != null) user.setUsername(dto.getUsername());
        if(dto.getAvatar() != null) user.setAvatar(dto.getAvatar());

        userMapper.updateById(user);
    }

    // 从Token获取用户信息
    @Override
    public User getUserInfoFromToken(String token) {
        if(jwtUtil.IsTokenInvalidOrInactive(token)){
            throw new RuntimeException("Token 信息无效");
        }

        Long userId = jwtUtil.getUserId(token);
        User user = userMapper.selectById(userId);

        if(user == null){
            throw new NullPointerException("用户不存在");
        }

        return user;
    }
}
