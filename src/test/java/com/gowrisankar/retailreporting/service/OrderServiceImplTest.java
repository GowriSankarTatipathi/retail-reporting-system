package com.gowrisankar.retailreporting.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.gowrisankar.retailreporting.domain.entity.Category;
import com.gowrisankar.retailreporting.domain.entity.Customer;
import com.gowrisankar.retailreporting.domain.entity.Order;
import com.gowrisankar.retailreporting.domain.entity.OrderStatus;
import com.gowrisankar.retailreporting.domain.entity.Product;
import com.gowrisankar.retailreporting.dto.request.OrderItemRequest;
import com.gowrisankar.retailreporting.dto.request.OrderRequest;
import com.gowrisankar.retailreporting.dto.response.OrderResponse;
import com.gowrisankar.retailreporting.exception.BusinessRuleViolationException;
import com.gowrisankar.retailreporting.exception.InsufficientStockException;
import com.gowrisankar.retailreporting.exception.InvalidOrderStateException;
import com.gowrisankar.retailreporting.repository.CustomerRepository;
import com.gowrisankar.retailreporting.repository.OrderRepository;
import com.gowrisankar.retailreporting.repository.ProductRepository;
import com.gowrisankar.retailreporting.service.impl.OrderServiceImpl;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OrderServiceImplTest {

    private OrderRepository orderRepository;
    private CustomerRepository customerRepository;
    private ProductRepository productRepository;
    private InventoryService inventoryService;
    private OrderService orderService;

    private Customer customer;
    private Product product;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        customerRepository = mock(CustomerRepository.class);
        productRepository = mock(ProductRepository.class);
        inventoryService = mock(InventoryService.class);

        orderService = new OrderServiceImpl(orderRepository, customerRepository, productRepository, inventoryService);

        customer = Customer.builder().id(1L).firstName("Ava").lastName("Thompson")
                .email("ava@example.com").build();
        Category category = Category.builder().id(1L).name("Electronics").build();
        product = Product.builder().id(10L).sku("SKU-10").name("Earbuds").category(category)
                .price(new BigDecimal("49.99")).costPrice(new BigDecimal("20.00")).active(true).build();

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order order = inv.getArgument(0);
            order.setId(100L);
            return order;
        });
    }

    @Test
    void createPlacesOrderAndReservesStockForEachLineItem() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        OrderRequest request = new OrderRequest(1L, List.of(new OrderItemRequest(10L, 3)));
        OrderResponse response = orderService.create(request);

        assertThat(response.customerId()).isEqualTo(1L);
        assertThat(response.status()).isEqualTo(OrderStatus.PENDING);
        assertThat(response.totalAmount()).isEqualByComparingTo(new BigDecimal("149.97"));
        assertThat(response.items()).hasSize(1);
        verify(inventoryService).reserveStock(10L, 3);
    }

    @Test
    void createRollsBackWhenStockIsInsufficient() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        doThrow(new InsufficientStockException("not enough stock"))
                .when(inventoryService).reserveStock(anyLong(), anyInt());

        OrderRequest request = new OrderRequest(1L, List.of(new OrderItemRequest(10L, 999)));

        assertThatThrownBy(() -> orderService.create(request))
                .isInstanceOf(InsufficientStockException.class);

        verify(orderRepository, times(0)).save(any());
    }

    @Test
    void createRejectsInactiveProducts() {
        product.setActive(false);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        OrderRequest request = new OrderRequest(1L, List.of(new OrderItemRequest(10L, 1)));

        assertThatThrownBy(() -> orderService.create(request))
                .isInstanceOf(BusinessRuleViolationException.class);
    }

    @Test
    void updateStatusRejectsInvalidTransition() {
        Order order = Order.builder().id(100L).customer(customer).status(OrderStatus.DELIVERED).build();
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.updateStatus(100L, OrderStatus.PENDING))
                .isInstanceOf(InvalidOrderStateException.class);
    }

    @Test
    void updateStatusToCancelledReleasesStockForEveryItem() {
        Order order = Order.builder().id(100L).customer(customer).status(OrderStatus.PENDING).build();
        var item = com.gowrisankar.retailreporting.domain.entity.OrderItem.builder()
                .product(product).quantity(2).unitPrice(product.getPrice()).build();
        item.computeSubtotal();
        order.addItem(item);
        order.recalculateTotal();

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));

        orderService.updateStatus(100L, OrderStatus.CANCELLED);

        verify(inventoryService).releaseStock(10L, 2);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }
}
