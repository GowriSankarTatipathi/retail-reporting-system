package com.gowrisankar.retailreporting.dto.report;

import java.time.format.DateTimeFormatter;

/** Bucketing granularity for the revenue trend report. */
public enum ReportGranularity {
    DAILY(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
    MONTHLY(DateTimeFormatter.ofPattern("yyyy-MM"));

    private final DateTimeFormatter formatter;

    ReportGranularity(DateTimeFormatter formatter) {
        this.formatter = formatter;
    }

    public DateTimeFormatter formatter() {
        return formatter;
    }
}
