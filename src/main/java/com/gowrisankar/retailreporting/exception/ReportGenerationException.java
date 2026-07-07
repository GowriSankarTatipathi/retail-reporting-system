package com.gowrisankar.retailreporting.exception;

/** Wraps checked I/O failures from CSV/PDF rendering into an unchecked exception (500). */
public class ReportGenerationException extends RuntimeException {

    public ReportGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
