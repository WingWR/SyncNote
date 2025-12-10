package com.syncnote.user.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.syncnote.user.dto.request.LoginRequestDTO;
import com.syncnote.user.dto.response.LoginResponseDTO;
import com.syncnote.user.dto.request.RegisterRequestDTO;
import com.syncnote.user.mapper.UserMapper;
import com.syncnote.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class AuthService {

    @Autowired
    UserMapper userMapper;

    @Autowired
    BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public User register(RegisterRequestDTO dto) throws Exception {
        if(userMapper.selectOne(new QueryWrapper<User>().eq("email", dto.getEmail())) != null){
            throw new Exception("邮箱已被注册");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());

        String hashedPassword = passwordEncoder.encode(dto.getPassword());
        user.setPasswordHash(hashedPassword);

        userMapper.insert(user);
        return user;
    }

    public LoginResponseDTO login(LoginRequestDTO dto) throws Exception {
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("email", dto.getEmail()));
        if(user == null) throw new Exception("用户不存在");

        boolean isPasswordMatch = passwordEncoder.matches(dto.getPassword(), user.getPasswordHash());

        if(!isPasswordMatch){
            throw new Exception("密码错误");
        }

        // 简单示例，token 可以是随机 UUID，生产用 JWT
        String token = UUID.randomUUID().toString();

        Long userId = user.getId();
        redisTemplate.opsForValue().set(token, userId, 12, TimeUnit.HOURS);

        return new LoginResponseDTO(user, token);
    }
}
