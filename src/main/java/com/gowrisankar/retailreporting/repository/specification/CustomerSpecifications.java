package com.gowrisankar.retailreporting.repository.specification;

import com.gowrisankar.retailreporting.domain.entity.Customer;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class CustomerSpecifications {

    private CustomerSpecifications() {
    }

    public static Specification<Customer> search(String term) {
        if (!StringUtils.hasText(term)) {
            return null;
        }
        String pattern = "%" + term.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("firstName")), pattern),
                cb.like(cb.lower(root.get("lastName")), pattern),
                cb.like(cb.lower(root.get("email")), pattern)
        );
    }

    public static Specification<Customer> inState(String state) {
        if (!StringUtils.hasText(state)) {
            return null;
        }
        return (root, query, cb) -> cb.equal(cb.lower(root.get("state")), state.toLowerCase());
    }
}
