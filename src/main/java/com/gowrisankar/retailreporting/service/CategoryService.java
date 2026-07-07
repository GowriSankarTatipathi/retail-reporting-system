package com.gowrisankar.retailreporting.service;

import com.gowrisankar.retailreporting.dto.request.CategoryRequest;
import com.gowrisankar.retailreporting.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {

    List<CategoryResponse> listAll();

    CategoryResponse getById(Long id);

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);
}
