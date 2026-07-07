package com.gowrisankar.retailreporting.dto.report;

import java.math.BigDecimal;

/** One bucket (day or month, depending on requested granularity) of a revenue trend report. */
public record RevenueTrendPoint(
        String period,
        BigDecimal revenue,
        Long orderCount
) {
}
