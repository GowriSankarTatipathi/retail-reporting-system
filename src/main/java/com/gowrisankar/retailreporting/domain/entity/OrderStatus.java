package com.gowrisankar.retailreporting.domain.entity;

import java.util.EnumSet;
import java.util.Set;

/**
 * Order lifecycle states. Mirrors the {@code chk_orders_status} CHECK constraint in
 * {@code V1__init_schema.sql}.
 */
public enum OrderStatus {
    PENDING,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    /**
     * Valid forward transitions for each status. Enforced by
     * {@code OrderService.updateStatus} so an order can never move backwards or skip
     * states (e.g. PENDING straight to DELIVERED).
     */
    public Set<OrderStatus> allowedNextStates() {
        return switch (this) {
            case PENDING -> EnumSet.of(PROCESSING, CANCELLED);
            case PROCESSING -> EnumSet.of(SHIPPED, CANCELLED);
            case SHIPPED -> EnumSet.of(DELIVERED);
            case DELIVERED, CANCELLED -> EnumSet.noneOf(OrderStatus.class);
        };
    }

    public boolean canTransitionTo(OrderStatus target) {
        return allowedNextStates().contains(target);
    }

    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED;
    }

    /** Whether inventory should be released back to stock when entering this status. */
    public boolean releasesInventory() {
        return this == CANCELLED;
    }
}
