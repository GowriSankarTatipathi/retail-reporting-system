package com.gowrisankar.retailreporting.repository.specification;

import com.gowrisankar.retailreporting.domain.entity.Order;
import com.gowrisankar.retailreporting.domain.entity.OrderStatus;
import java.time.LocalDateTime;
import org.springframework.data.jpa.domain.Specification;

public final class OrderSpecifications {

    private OrderSpecifications() {
    }

    public static Specification<Order> hasStatus(OrderStatus status) {
        if (status == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Order> hasCustomerId(Long customerId) {
        if (customerId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("customer").get("id"), customerId);
    }

    public static Specification<Order> orderDateBetween(LocalDateTime start, LocalDateTime end) {
        if (start == null && end == null) {
            return null;
        }
        return (root, query, cb) -> {
            if (start != null && end != null) {
                return cb.between(root.get("orderDate"), start, end);
            } else if (start != null) {
                return cb.greaterThanOrEqualTo(root.get("orderDate"), start);
            } else {
                return cb.lessThanOrEqualTo(root.get("orderDate"), end);
            }
        };
    }
}
