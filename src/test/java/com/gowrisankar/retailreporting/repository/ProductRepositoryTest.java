package com.gowrisankar.retailreporting.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.gowrisankar.retailreporting.domain.entity.Category;
import com.gowrisankar.retailreporting.domain.entity.Product;
import com.gowrisankar.retailreporting.repository.specification.ProductSpecifications;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.jpa.domain.Specification;

/**
 * Uses Spring Boot's default {@code @DataJpaTest} embedded-database behavior (H2,
 * schema generated straight from the entity model) - no external Postgres needed.
 */
@DataJpaTest
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private Category electronics;

    @BeforeEach
    void setUp() {
        electronics = categoryRepository.save(Category.builder().name("Electronics").description("Gadgets").build());
    }

    @Test
    void findsProductBySkuCaseInsensitively() {
        productRepository.save(Product.builder()
                .sku("ELEC-1001").name("Wireless Earbuds").category(electronics)
                .price(new BigDecimal("49.99")).costPrice(new BigDecimal("20.00")).active(true).build());

        assertThat(productRepository.findBySkuIgnoreCase("elec-1001")).isPresent();
        assertThat(productRepository.existsBySkuIgnoreCase("ELEC-1001")).isTrue();
        assertThat(productRepository.existsBySkuIgnoreCase("does-not-exist")).isFalse();
    }

    @Test
    void specificationFiltersByCategoryActiveAndPriceRange() {
        productRepository.save(Product.builder()
                .sku("A1").name("Cheap Active").category(electronics)
                .price(new BigDecimal("10.00")).costPrice(BigDecimal.ONE).active(true).build());
        productRepository.save(Product.builder()
                .sku("A2").name("Expensive Active").category(electronics)
                .price(new BigDecimal("500.00")).costPrice(BigDecimal.ONE).active(true).build());
        productRepository.save(Product.builder()
                .sku("A3").name("Cheap Inactive").category(electronics)
                .price(new BigDecimal("10.00")).costPrice(BigDecimal.ONE).active(false).build());

        Specification<Product> spec = Specification.where(ProductSpecifications.isActive(true))
                .and(ProductSpecifications.priceBetween(BigDecimal.ZERO, new BigDecimal("100.00")));

        var results = productRepository.findAll(spec);

        assertThat(results).extracting(Product::getSku).containsExactly("A1");
    }

    @Test
    void specificationSearchMatchesNameOrSku() {
        productRepository.save(Product.builder()
                .sku("SPT-5001").name("Yoga Mat Premium").category(electronics)
                .price(BigDecimal.TEN).costPrice(BigDecimal.ONE).active(true).build());

        var bySkuFragment = productRepository.findAll(ProductSpecifications.search("spt-5"));
        var byNameFragment = productRepository.findAll(ProductSpecifications.search("yoga"));
        var noMatch = productRepository.findAll(ProductSpecifications.search("nonexistent-term"));

        assertThat(bySkuFragment).hasSize(1);
        assertThat(byNameFragment).hasSize(1);
        assertThat(noMatch).isEmpty();
    }
}
