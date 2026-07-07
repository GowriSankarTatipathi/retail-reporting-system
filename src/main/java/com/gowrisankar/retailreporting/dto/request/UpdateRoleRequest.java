package com.gowrisankar.retailreporting.dto.request;

import com.gowrisankar.retailreporting.domain.entity.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(
        @NotNull(message = "Role is required")
        Role role
) {
}
