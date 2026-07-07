package com.gowrisankar.retailreporting.service.export;

import java.util.List;

public interface ReportExportService {

    /** Renders a simple tabular report as CSV bytes (UTF-8, RFC 4180 quoting via Commons CSV). */
    byte[] toCsv(List<String> headers, List<List<String>> rows);

    /** Renders a simple tabular report as a paginated, print-ready PDF. */
    byte[] toPdf(String title, List<String> headers, List<List<String>> rows);
}
