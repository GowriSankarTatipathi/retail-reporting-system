package com.gowrisankar.retailreporting.mapper;

import com.gowrisankar.retailreporting.domain.entity.Order;
import com.gowrisankar.retailreporting.domain.entity.OrderItem;
import com.gowrisankar.retailreporting.dto.response.OrderItemResponse;
import com.gowrisankar.retailreporting.dto.response.OrderResponse;
import java.util.List;

public final class OrderMapper {

    private OrderMapper() {
    }

    public static OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(OrderMapper::toItemResponse)
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getCustomer().getId(),
                order.getCustomer().getFullName(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getOrderDate(),
                items,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    public static OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getProduct().getId(),
                item.getProduct().getSku(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal()
        );
    }
}
