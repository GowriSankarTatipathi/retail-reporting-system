package com.gowrisankar.retailreporting.mapper;

import com.gowrisankar.retailreporting.domain.entity.User;
import com.gowrisankar.retailreporting.dto.response.UserResponse;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }
}
