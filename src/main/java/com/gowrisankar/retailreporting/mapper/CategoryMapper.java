package com.gowrisankar.retailreporting.mapper;

import com.gowrisankar.retailreporting.domain.entity.Category;
import com.gowrisankar.retailreporting.dto.response.CategoryResponse;

public final class CategoryMapper {

    private CategoryMapper() {
    }

    public static CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription());
    }
}
