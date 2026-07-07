package com.gowrisankar.retailreporting.dto.response;

import java.time.LocalDateTime;

public record InventoryResponse(
        Long productId,
        String sku,
        String productName,
        Integer quantityOnHand,
        Integer reorderLevel,
        String warehouseLocation,
        boolean lowStock,
        LocalDateTime updatedAt
) {
}
