package com.gowrisankar.retailreporting.exception;

/** Generic 409 for domain-rule violations that don't warrant their own exception type. */
public class BusinessRuleViolationException extends RuntimeException {

    public BusinessRuleViolationException(String message) {
        super(message);
    }
}
