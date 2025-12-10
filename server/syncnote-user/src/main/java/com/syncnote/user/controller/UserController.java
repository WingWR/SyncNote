package com.syncnote.user.controller;

import com.syncnote.user.dto.request.UpdateUserRequestDTO;
import com.syncnote.user.model.User;
import com.syncnote.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/me")
    public User getCurrentUser(@RequestHeader("X-User-Id") Long userId){
        return userService.getCurrentUser(userId);
    }

    @PutMapping("/me")
    public User updateCurrentUser(@RequestHeader("X-User-Id") Long userId,
                                  @RequestBody UpdateUserRequestDTO dto) {
        return userService.updateUserInfo(userId, dto);
    }
}
