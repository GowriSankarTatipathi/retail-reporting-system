package com.gowrisankar.retailreporting.dto.report;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.io.Serializable;

/**
 * KPI snapshot backing the dashboard endpoint. Implements {@link Serializable} because
 * it is stored in the Redis cache (see {@code CacheConfig}), which serializes cached
 * values.
 */
public record DashboardSummary(
        BigDecimal totalRevenue,
        long totalOrders,
        BigDecimal averageOrderValue,
        long activeCustomers,
        long lowStockCount,
        LocalDateTime generatedAt
) implements Serializable {
}
