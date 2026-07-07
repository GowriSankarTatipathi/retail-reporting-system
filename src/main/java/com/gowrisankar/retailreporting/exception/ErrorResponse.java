package com.gowrisankar.retailreporting.exception;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Uniform error payload returned by every non-2xx response (FR-24). {@code fieldErrors}
 * is {@code null} unless the failure was a bean-validation error, in which case it maps
 * field name -> human-readable message.
 */
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, List<String>> fieldErrors
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(LocalDateTime.now(), status, error, message, path, null);
    }

    public static ErrorResponse ofValidation(int status, String message, String path,
                                              Map<String, List<String>> fieldErrors) {
        return new ErrorResponse(LocalDateTime.now(), status, "Validation Failed", message, path, fieldErrors);
    }
}
