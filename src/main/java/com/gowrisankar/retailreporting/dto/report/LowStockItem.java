package com.gowrisankar.retailreporting.dto.report;

/** One row of the low-stock alert report. */
public record LowStockItem(
        Long productId,
        String sku,
        String productName,
        String categoryName,
        Integer quantityOnHand,
        Integer reorderLevel,
        String warehouseLocation
) {
}
