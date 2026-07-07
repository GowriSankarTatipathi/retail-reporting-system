package com.gowrisankar.retailreporting.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.gowrisankar.retailreporting.domain.entity.Category;
import com.gowrisankar.retailreporting.dto.request.CategoryRequest;
import com.gowrisankar.retailreporting.exception.BusinessRuleViolationException;
import com.gowrisankar.retailreporting.exception.DuplicateResourceException;
import com.gowrisankar.retailreporting.repository.CategoryRepository;
import com.gowrisankar.retailreporting.repository.ProductRepository;
import com.gowrisankar.retailreporting.service.impl.CategoryServiceImpl;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CategoryServiceImplTest {

    private CategoryRepository categoryRepository;
    private ProductRepository productRepository;
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        categoryRepository = mock(CategoryRepository.class);
        productRepository = mock(ProductRepository.class);
        categoryService = new CategoryServiceImpl(categoryRepository, productRepository);
    }

    @Test
    void createThrowsWhenNameAlreadyExists() {
        when(categoryRepository.existsByNameIgnoreCase("Electronics")).thenReturn(true);
        CategoryRequest request = new CategoryRequest("Electronics", "desc");

        assertThatThrownBy(() -> categoryService.create(request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(categoryRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deleteThrowsWhenProductsStillReferenceTheCategory() {
        Category category = Category.builder().id(1L).name("Electronics").build();
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.existsByCategoryId(1L)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.delete(1L))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("Electronics");

        verify(categoryRepository, never()).delete(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deleteSucceedsWhenNoProductsReferenceTheCategory() {
        Category category = Category.builder().id(2L).name("Unused").build();
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(productRepository.existsByCategoryId(2L)).thenReturn(false);

        categoryService.delete(2L);

        verify(categoryRepository).delete(category);
    }
}
