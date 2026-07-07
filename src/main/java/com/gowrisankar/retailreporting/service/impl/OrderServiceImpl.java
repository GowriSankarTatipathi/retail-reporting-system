package com.gowrisankar.retailreporting.service.impl;

import com.gowrisankar.retailreporting.domain.entity.Customer;
import com.gowrisankar.retailreporting.domain.entity.Order;
import com.gowrisankar.retailreporting.domain.entity.OrderItem;
import com.gowrisankar.retailreporting.domain.entity.OrderStatus;
import com.gowrisankar.retailreporting.domain.entity.Product;
import com.gowrisankar.retailreporting.dto.request.OrderItemRequest;
import com.gowrisankar.retailreporting.dto.request.OrderRequest;
import com.gowrisankar.retailreporting.dto.response.OrderResponse;
import com.gowrisankar.retailreporting.dto.response.PageResponse;
import com.gowrisankar.retailreporting.exception.BusinessRuleViolationException;
import com.gowrisankar.retailreporting.exception.InvalidOrderStateException;
import com.gowrisankar.retailreporting.exception.ResourceNotFoundException;
import com.gowrisankar.retailreporting.mapper.OrderMapper;
import com.gowrisankar.retailreporting.repository.CustomerRepository;
import com.gowrisankar.retailreporting.repository.OrderRepository;
import com.gowrisankar.retailreporting.repository.ProductRepository;
import com.gowrisankar.retailreporting.repository.specification.OrderSpecifications;
import com.gowrisankar.retailreporting.service.InventoryService;
import com.gowrisankar.retailreporting.service.OrderService;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    public OrderServiceImpl(OrderRepository orderRepository,
                             CustomerRepository customerRepository,
                             ProductRepository productRepository,
                             InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> search(Long customerId, OrderStatus status,
                                               LocalDateTime start, LocalDateTime end, Pageable pageable) {
        Specification<Order> spec = Specification.where(OrderSpecifications.hasCustomerId(customerId))
                .and(OrderSpecifications.hasStatus(status))
                .and(OrderSpecifications.orderDateBetween(start, end));
        Page<OrderResponse> page = orderRepository.findAll(spec, pageable).map(OrderMapper::toResponse);
        return PageResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        return OrderMapper.toResponse(findOrThrow(id));
    }

    /**
     * Places an order. Runs in a single transaction: every line item's stock is
     * reserved (pessimistic lock per product, see docs/architecture.md §10) before the
     * order is persisted, so either the whole order succeeds or nothing is written -
     * there is no window where inventory is decremented but the order failed to save,
     * or vice versa.
     */
    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public OrderResponse create(OrderRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> ResourceNotFoundException.of("Customer", request.customerId()));

        Order order = Order.builder()
                .customer(customer)
                .status(OrderStatus.PENDING)
                .build();

        for (OrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Product", itemRequest.productId()));

            if (!product.isActive()) {
                throw new BusinessRuleViolationException(
                        "Product '" + product.getName() + "' is not active and cannot be ordered");
            }

            // Reserve (and lock) stock before committing to the line item - throws
            // InsufficientStockException if unavailable, rolling back the transaction.
            inventoryService.reserveStock(product.getId(), itemRequest.quantity());

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .unitPrice(product.getPrice())
                    .build();
            item.computeSubtotal();
            order.addItem(item);
        }

        order.recalculateTotal();
        Order saved = orderRepository.save(order);
        log.info("Order created: id={}, customerId={}, total={}", saved.getId(), customer.getId(), saved.getTotalAmount());
        return OrderMapper.toResponse(saved);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus newStatus) {
        Order order = findOrThrow(id);
        OrderStatus current = order.getStatus();

        if (!current.canTransitionTo(newStatus)) {
            throw new InvalidOrderStateException(
                    "Cannot transition order " + id + " from " + current + " to " + newStatus);
        }

        if (newStatus.releasesInventory()) {
            for (OrderItem item : order.getItems()) {
                inventoryService.releaseStock(item.getProduct().getId(), item.getQuantity());
            }
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        log.info("Order {} status changed: {} -> {}", id, current, newStatus);
        return OrderMapper.toResponse(saved);
    }

    private Order findOrThrow(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Order", id));
    }
}
