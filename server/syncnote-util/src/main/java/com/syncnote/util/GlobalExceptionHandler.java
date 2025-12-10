package com.syncnote.util;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ApiResponse<?> handleRuntimeException(RuntimeException e) {
        return ApiResponse.fail(400, "发生逻辑异常" + e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ApiResponse<?> handleException(Exception e){
        return ApiResponse.fail(500, "系统内部异常: " + e.getMessage());
    }
}
