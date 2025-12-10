package com.syncnote.user.service;

import com.syncnote.user.dto.response.UpdateUserDTO;
import com.syncnote.user.mapper.UserMapper;
import com.syncnote.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;

    public User getCurrentUser(long userId){
        return userMapper.selectById(userId);
    }

    public User updateUserInfo(long userId, UpdateUserDTO dto){
        User user = userMapper.selectById(userId);
        if(user == null) return null;

        if(dto.getUsername() != null) user.setUsername(dto.getUsername());
        if(dto.getAvatar() != null) user.setAvatar(dto.getAvatar());

        userMapper.updateById(user);
        return user;
    }


}
