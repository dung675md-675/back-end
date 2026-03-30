package com.secondhand.shop.user.service;

import com.secondhand.shop.user.dto.AuthDTO;

public interface AuthService {

    AuthDTO.LoginResponse login(AuthDTO.LoginRequest request);

    AuthDTO.LoginResponse register(AuthDTO.RegisterRequest request);
}