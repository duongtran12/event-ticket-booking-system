package com.duong.eventticket.service;

import com.duong.eventticket.dto.request.LoginRequest;
import com.duong.eventticket.dto.request.RegisterRequest;
import com.duong.eventticket.dto.response.LoginResponse;
import com.duong.eventticket.dto.response.MessageResponse;

public interface AuthService {

    MessageResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
}