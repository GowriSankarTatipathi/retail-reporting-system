package com.gowrisankar.retailreporting.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Adjusts stock by a signed delta (positive = restock, negative = manual write-off).
 * Order-driven decrements/releases go through {@code InventoryService.reserveStock}/
 * {@code releaseStock} instead of this endpoint.
 */
public record InventoryAdjustRequest(

        @NotNull(message = "Quantity delta is required")
        Integer quantityDelta,

        String reason
) {
}
