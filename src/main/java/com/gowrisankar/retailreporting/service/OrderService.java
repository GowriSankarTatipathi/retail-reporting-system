package com.gowrisankar.retailreporting.service;

import com.gowrisankar.retailreporting.domain.entity.OrderStatus;
import com.gowrisankar.retailreporting.dto.request.OrderRequest;
import com.gowrisankar.retailreporting.dto.response.OrderResponse;
import com.gowrisankar.retailreporting.dto.response.PageResponse;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    PageResponse<OrderResponse> search(Long customerId, OrderStatus status,
                                        LocalDateTime start, LocalDateTime end, Pageable pageable);

    OrderResponse getById(Long id);

    OrderResponse create(OrderRequest request);

    OrderResponse updateStatus(Long id, OrderStatus newStatus);
}
