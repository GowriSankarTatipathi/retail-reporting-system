package com.gowrisankar.retailreporting.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        Long id,
        String sku,
        String name,
        String description,
        Long categoryId,
        String categoryName,
        BigDecimal price,
        BigDecimal costPrice,
        boolean active,
        Integer quantityOnHand,
        Integer reorderLevel,
        boolean lowStock,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
