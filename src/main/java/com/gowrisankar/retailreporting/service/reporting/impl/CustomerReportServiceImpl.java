package com.gowrisankar.retailreporting.service.reporting.impl;

import com.gowrisankar.retailreporting.domain.entity.OrderStatus;
import com.gowrisankar.retailreporting.dto.report.TopCustomerPoint;
import com.gowrisankar.retailreporting.repository.OrderRepository;
import com.gowrisankar.retailreporting.service.reporting.CustomerReportService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerReportServiceImpl implements CustomerReportService {

    private final OrderRepository orderRepository;

    public CustomerReportServiceImpl(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopCustomerPoint> getTopCustomers(LocalDateTime start, LocalDateTime end, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return orderRepository.findTopCustomers(start, end, OrderStatus.CANCELLED, pageable);
    }
}
