package com.gowrisankar.retailreporting.mapper;

import com.gowrisankar.retailreporting.domain.entity.Customer;
import com.gowrisankar.retailreporting.dto.response.CustomerResponse;

public final class CustomerMapper {

    private CustomerMapper() {
    }

    public static CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getCity(),
                customer.getState(),
                customer.getZipCode(),
                customer.getCreatedAt()
        );
    }
}
