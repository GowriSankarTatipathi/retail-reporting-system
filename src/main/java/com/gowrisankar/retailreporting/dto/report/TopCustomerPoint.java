package com.gowrisankar.retailreporting.dto.report;

import java.math.BigDecimal;

/** One row of a top-customers-by-spend report. */
public record TopCustomerPoint(
        Long customerId,
        String customerName,
        String email,
        BigDecimal totalSpent,
        Long orderCount
) {
}
