package com.syncnote.user.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.syncnote.user.dto.request.LoginRequestDTO;
import com.syncnote.user.dto.response.LoginResponseDTO;
import com.syncnote.user.dto.request.RegisterRequestDTO;
import com.syncnote.user.dto.response.UserResponseOfLoginInfo;
import com.syncnote.user.mapper.UserMapper;
import com.syncnote.user.model.User;
import com.syncnote.util.JWT.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public void register(RegisterRequestDTO dto) {
        // 检查邮箱可用性
        if(userMapper.selectOne(new QueryWrapper<User>().eq("email", dto.getEmail())) != null){
            throw new RuntimeException("该邮箱已被注册");
        }

        // 创建新用户
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());

        // 使用BCrypt加密
        String hashedPassword = passwordEncoder.encode(dto.getPassword());
        user.setPasswordHash(hashedPassword);

        // 插入至数据库
        userMapper.insert(user);
    }

    // 用户登录的逻辑
    public LoginResponseDTO login(LoginRequestDTO dto) {
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("email", dto.getEmail()));
        if(user == null) throw new RuntimeException("该用户不存在");

        boolean isPasswordMatch = passwordEncoder.matches(dto.getPassword(), user.getPasswordHash());
        if(!isPasswordMatch){
            throw new RuntimeException("输入密码错误");
        }

        String token = jwtUtil.generateToken(user.getId());

        return new LoginResponseDTO(
                new UserResponseOfLoginInfo(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getAvatar(),
                    user.getCreatedAt()
                ),

                token
        );
    }

    // 用户退出登录
    public void logout(String token){
        if(!jwtUtil.validateToken(token)){
            throw new RuntimeException("Token信息无效");
        }

        // 删除Token在Redis的缓存
        jwtUtil.invalidateToken(token);
    }

}
