package com.gowrisankar.retailreporting.dto.request;

import com.gowrisankar.retailreporting.domain.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(
        @NotNull(message = "Status is required")
        OrderStatus status
) {
}
