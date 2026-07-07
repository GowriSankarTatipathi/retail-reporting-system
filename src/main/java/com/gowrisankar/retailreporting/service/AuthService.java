package com.gowrisankar.retailreporting.service;

import com.gowrisankar.retailreporting.dto.request.ChangePasswordRequest;
import com.gowrisankar.retailreporting.dto.request.LoginRequest;
import com.gowrisankar.retailreporting.dto.request.RefreshRequest;
import com.gowrisankar.retailreporting.dto.request.RegisterRequest;
import com.gowrisankar.retailreporting.dto.request.UpdateProfileRequest;
import com.gowrisankar.retailreporting.dto.response.AuthResponse;
import com.gowrisankar.retailreporting.dto.response.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshRequest request);

    /** Self-service - the caller's own profile, resolved from the authenticated principal. */
    UserResponse getCurrentUser(String email);

    /** Self-service - update the caller's own display name (email/role are not editable here). */
    UserResponse updateProfile(String email, UpdateProfileRequest request);

    /** Self-service - change the caller's own password after verifying the current one. */
    void changePassword(String email, ChangePasswordRequest request);
}
