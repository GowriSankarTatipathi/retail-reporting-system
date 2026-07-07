package com.gowrisankar.retailreporting.dto.response;

import java.util.List;
import org.springframework.data.domain.Page;

/**
 * Stable, API-contract wrapper around Spring Data's {@link Page} so the JSON shape of
 * paginated responses never changes just because the internal pagination library does.
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
