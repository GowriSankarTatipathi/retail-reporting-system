package com.gowrisankar.retailreporting.service;

import com.gowrisankar.retailreporting.dto.request.CustomerRequest;
import com.gowrisankar.retailreporting.dto.response.CustomerResponse;
import com.gowrisankar.retailreporting.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

    PageResponse<CustomerResponse> search(String q, String state, Pageable pageable);

    CustomerResponse getById(Long id);

    CustomerResponse create(CustomerRequest request);

    CustomerResponse update(Long id, CustomerRequest request);

    void delete(Long id);
}
