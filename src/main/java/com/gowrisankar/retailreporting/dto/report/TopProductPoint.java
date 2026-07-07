package com.gowrisankar.retailreporting.dto.report;

import java.math.BigDecimal;

/** One row of a top-selling-products report. */
public record TopProductPoint(
        Long productId,
        String sku,
        String productName,
        Long quantitySold,
        BigDecimal revenue
) {
}
