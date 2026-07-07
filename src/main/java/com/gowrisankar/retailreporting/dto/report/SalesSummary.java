package com.gowrisankar.retailreporting.dto.report;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Aggregate sales figures over a date range. */
public record SalesSummary(
        BigDecimal totalRevenue,
        long totalOrders,
        BigDecimal averageOrderValue
) {
    public static SalesSummary of(BigDecimal totalRevenue, long totalOrders) {
        BigDecimal avg = totalOrders == 0
                ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);
        return new SalesSummary(totalRevenue, totalOrders, avg);
    }
}
