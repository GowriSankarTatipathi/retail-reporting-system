package com.gowrisankar.retailreporting.dto.response;

import com.gowrisankar.retailreporting.domain.entity.Role;
import java.time.LocalDateTime;

/** Never includes {@code passwordHash} - see docs/architecture.md decision on DTOs vs entities. */
public record UserResponse(
        Long id,
        String email,
        String fullName,
        Role role,
        boolean enabled,
        LocalDateTime createdAt
) {
}
