package com.gowrisankar.retailreporting.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Structured, single-line-per-request access logging (method, path, status, duration,
 * acting user) - supports FR-25 (audit-style logging) without needing a separate audit
 * table for read traffic. A correlation id is pushed into MDC so every log line emitted
 * while handling a request can be tied back to it.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("com.gowrisankar.retailreporting.access");
    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String MDC_REQUEST_ID = "requestId";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        long start = System.currentTimeMillis();
        String requestId = resolveRequestId(request);
        MDC.put(MDC_REQUEST_ID, requestId);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long durationMs = System.currentTimeMillis() - start;
            Object actor = request.getAttribute("actorEmail");
            log.info("{} {} -> {} ({} ms) actor={}",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), durationMs,
                    actor != null ? actor : "anonymous");
            MDC.remove(MDC_REQUEST_ID);
        }
    }

    private String resolveRequestId(HttpServletRequest request) {
        String existing = request.getHeader(REQUEST_ID_HEADER);
        return (existing != null && !existing.isBlank()) ? existing : java.util.UUID.randomUUID().toString();
    }
}
