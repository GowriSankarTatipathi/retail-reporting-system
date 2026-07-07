package com.gowrisankar.retailreporting.service.impl;

import com.gowrisankar.retailreporting.domain.entity.Customer;
import com.gowrisankar.retailreporting.dto.request.CustomerRequest;
import com.gowrisankar.retailreporting.dto.response.CustomerResponse;
import com.gowrisankar.retailreporting.dto.response.PageResponse;
import com.gowrisankar.retailreporting.exception.BusinessRuleViolationException;
import com.gowrisankar.retailreporting.exception.DuplicateResourceException;
import com.gowrisankar.retailreporting.exception.ResourceNotFoundException;
import com.gowrisankar.retailreporting.mapper.CustomerMapper;
import com.gowrisankar.retailreporting.repository.CustomerRepository;
import com.gowrisankar.retailreporting.repository.OrderRepository;
import com.gowrisankar.retailreporting.repository.specification.CustomerSpecifications;
import com.gowrisankar.retailreporting.service.CustomerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerServiceImpl implements CustomerService {

    private static final Logger log = LoggerFactory.getLogger(CustomerServiceImpl.class);

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository, OrderRepository orderRepository) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> search(String q, String state, Pageable pageable) {
        Specification<Customer> spec = Specification.where(CustomerSpecifications.search(q))
                .and(CustomerSpecifications.inState(state));
        Page<CustomerResponse> page = customerRepository.findAll(spec, pageable).map(CustomerMapper::toResponse);
        return PageResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        return CustomerMapper.toResponse(findOrThrow(id));
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (customerRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("A customer with email " + request.email() + " already exists");
        }
        Customer customer = Customer.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .phone(request.phone())
                .address(request.address())
                .city(request.city())
                .state(request.state())
                .zipCode(request.zipCode())
                .build();
        Customer saved = customerRepository.save(customer);
        log.info("Customer created: id={}", saved.getId());
        return CustomerMapper.toResponse(saved);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = findOrThrow(id);
        if (!customer.getEmail().equalsIgnoreCase(request.email())
                && customerRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("A customer with email " + request.email() + " already exists");
        }
        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());
        customer.setEmail(request.email());
        customer.setPhone(request.phone());
        customer.setAddress(request.address());
        customer.setCity(request.city());
        customer.setState(request.state());
        customer.setZipCode(request.zipCode());
        Customer saved = customerRepository.save(customer);
        log.info("Customer updated: id={}", saved.getId());
        return CustomerMapper.toResponse(saved);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void delete(Long id) {
        Customer customer = findOrThrow(id);
        if (orderRepository.existsByCustomerId(id)) {
            throw new BusinessRuleViolationException(
                    "Cannot delete customer '" + customer.getFullName() + "' - existing orders reference this customer");
        }
        customerRepository.delete(customer);
        log.info("Customer deleted: id={}", id);
    }

    private Customer findOrThrow(Long id) {
        return customerRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Customer", id));
    }
}
