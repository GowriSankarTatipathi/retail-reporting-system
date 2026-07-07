package com.gowrisankar.retailreporting.service;

import com.gowrisankar.retailreporting.dto.request.LoginRequest;
import com.gowrisankar.retailreporting.dto.request.RefreshRequest;
import com.gowrisankar.retailreporting.dto.request.RegisterRequest;
import com.gowrisankar.retailreporting.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshRequest request);
}
